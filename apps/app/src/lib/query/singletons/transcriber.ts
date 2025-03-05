import { createResultMutation } from '$lib/services';
import {
	playSoundIfEnabled,
	userConfiguredServices,
} from '$lib/services/index.js';
import { toast } from '$lib/services/toast';
import { settings } from '$lib/stores/settings.svelte';
import { WhisperingErr, type Recording } from '@repo/shared';
import { getContext, setContext } from 'svelte';
import { queryClient } from '..';
import type { LanguageType } from '$lib/services/transcription/TranscriptionService';

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
	const transcribeRecording = createResultMutation(() => ({
		mutationKey: transcriberKeys.transcribe,
		onMutate: ({
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

			return transcriptionResult;
		},
		onError: (error, { toastId }) => {
			toast.error({ id: toastId, ...error });
		},
		onSuccess: (data, { toastId }) => {			
			toast.success({
				id: toastId,
				title: '✅ Transformation successful!',
				description: `Transcribed text: ${data}`,
			});
			void playSoundIfEnabled('transcriptionComplete');
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
