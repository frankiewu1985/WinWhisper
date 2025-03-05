import { createResultMutation } from '$lib/services';
import type { Recording } from '$lib/services/db';
import {
	playSoundIfEnabled,
	userConfiguredServices,
} from '$lib/services/index.js';
import { toast } from '$lib/services/toast';
import { settings } from '$lib/stores/settings.svelte';
import { WhisperingErr } from '@repo/shared';
import { getContext, setContext } from 'svelte';
import { queryClient } from '..';
import { useUpdateRecording } from '../recordings/mutations';
import type { LanguageType } from '$lib/services/transcription/TranscriptionService';
import { writeTextToClipboard, writeTextToCursor } from './maybeCopyAndPaste';

export type Transcriber = ReturnType<typeof createTranscriber>;

export const initTranscriberInContext = () => {
	const transcriber = createTranscriber();
	setContext('transcriber', transcriber);
	return transcriber;
};

export const getTranscriberFromContext = () => {
	return getContext<Transcriber>('transcriber');
};

const transcriberKeys = {
	transcribe: ['transcriber', 'transcribe'] as const,
	transform: ['transcriber', 'transform'] as const,
} as const;

function createTranscriber() {
	const { updateRecording } = useUpdateRecording();

	const transcribeRecording = createResultMutation(() => ({
		mutationKey: transcriberKeys.transcribe,
		onMutate: ({
			recording,
			toastId,
		}: {
			recording: Recording;
			toastId: string;
		}) => {
			toast.loading({
				id: toastId,
				title: '📋 Transcribing...',
				description: 'Your recording is being transcribed...',
			});
			updateRecording.mutate(
				{ ...recording, transcriptionStatus: 'TRANSCRIBING' },
				{
					onError: (error) => {
						toast.warning({
							title:
								'⚠️ Unable to set recording transcription status to transcribing',
							description: 'Continuing with the transcription process...',
							action: { type: 'more-details', error },
						});
					},
				},
			);
		},
		mutationFn: async ({
			recording,
			language,
		}: {
			recording: Recording;
			toastId: string;
			language: LanguageType;
		}) => {
			if (!recording.blob) {
				return WhisperingErr({
					title: '⚠️ Recording blob not found',
					description: "Your recording doesn't have a blob to transcribe.",
				});
			}

			// construct the prompt
			const transcriptionResult =
				await userConfiguredServices.transcription.transcribe(recording.blob, {
					outputLanguage: language,
					prompt: settings.value['transcription.prompt'],
					temperature: settings.value['transcription.temperature'],
				});
			if (!transcriptionResult.ok) return transcriptionResult;
			const transcribedText = transcriptionResult.data;

			await updateRecording.mutateAsync(
				{ ...recording, transcribedText },
				{
					onError: (error) => {
						toast.error({
							title: '⚠️ Unable to update recording after transcription',
							description:
								"Transcription completed but unable to update recording's transcribed text in database",
							action: { type: 'more-details', error },
						});
					},
				},
			);

			return transcriptionResult;
		},
		onError: (error, { recording, toastId }) => {
			toast.error({ id: toastId, ...error });
			updateRecording.mutate(
				{ ...recording, transcriptionStatus: 'FAILED' },
				{
					onError: (error) => {
						toast.error({
							title:
								'⚠️ Unable to set recording transcription status to failed',
							description:
								'Transcription failed and failed again to update recording transcription status to failed',
							action: { type: 'more-details', error },
						});
					},
				},
			);
		},
		onSuccess: (transcribedText, { recording }) => {
			updateRecording.mutate(
				{ ...recording, transcribedText, transcriptionStatus: 'DONE' },
				{
					onError: (error) => {
						toast.error({
							title: '⚠️ Unable to update recording after transcription',
							description:
								"Transcription completed but unable to update recording's transcribed text and status in database",
							action: { type: 'more-details', error },
						});
					},
				},
			);
			void playSoundIfEnabled('transcriptionComplete');

			// if copy to clipboard is enabled, copy the transcription to clipboard
			if (settings.value['transcription.copyToClipboardOnSuccess']) {
				writeTextToClipboard(transcribedText);
			}
			if(settings.value['transcription.insertToCursorOnSuccess']) {
				writeTextToCursor(transcribedText);
			}
		},
	}));

	return {
		get isCurrentlyTranscribing() {
			return (
				queryClient.isMutating({
					mutationKey: transcriberKeys.transcribe,
				}) > 0
			);
		},
		transcribeRecording,
	};
}
