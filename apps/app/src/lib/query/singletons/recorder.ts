import { createResultMutation, createResultQuery } from '$lib/services';
import {
	playSoundIfEnabled,
	userConfiguredServices,
} from '$lib/services/index.js';
import type { UpdateStatusMessageFn } from '$lib/services/recorder/RecorderService';
import { toast } from '$lib/services/toast';
import { settings } from '$lib/stores/settings.svelte';
import { noop } from '@tanstack/table-core';
import { nanoid } from 'nanoid/non-secure';
import { getContext, setContext } from 'svelte';
import { queryClient } from '..';
import type { Transcriber } from './transcriber';
import type { Transformer } from './transformer';
import type { LanguageType } from '$lib/services/transcription/TranscriptionService';
import { writeTextToClipboard, writeTextToCursor } from './maybeCopyAndPaste';
import { showRecorderIndicator, hideRecorderIndicator } from './recorderIndicator';

export type Recorder = ReturnType<typeof createRecorder>;

export const initRecorderInContext = ({
	transcriber,
	transformer,
}: {
	transcriber: Transcriber;
	transformer: Transformer;
}) => {
	const recorder = createRecorder({ transcriber, transformer });
	setContext('recorder', recorder);
	return recorder;
};

export const getRecorderFromContext = () => {
	return getContext<Recorder>('recorder');
};

const recorderKeys = {
	all: ['recorder'] as const,
	state: ['recorder', 'state'] as const,
};

function createRecorder({
	transcriber,
	transformer,
}: {
	transcriber: Transcriber;
	transformer: Transformer;
}) {
	const invalidateRecorderState = () =>
		queryClient.invalidateQueries({ queryKey: recorderKeys.state });

	const recorderState = createResultQuery(() => ({
		queryKey: recorderKeys.state,
		queryFn: async () => {
			const recorderStateResult =
				await userConfiguredServices.recorder.getRecorderState();
			return recorderStateResult;
		},
		initialData: 'IDLE' as const,
	}));

	const startRecording = createResultMutation(() => ({
		onMutate: async ({ toastId }) => {
			await ensureRecordingSession.mutateAsync(toastId);
		},
		mutationFn: async ({ toastId }: { toastId: string }) => {
			const startRecordingResult =
				await userConfiguredServices.recorder.startRecording(nanoid(), {
					sendStatus: (options) => toast.loading({ id: toastId, ...options }),
				});
			return startRecordingResult;
		},
		onError: (error, { toastId }) => {
			toast.error({ id: toastId, ...error });
		},
		onSuccess: (_data, { toastId }) => {
			toast.success({
				id: toastId,
				title: '🎙️ recording...',
				description: 'Speak now and stop recording when done',
			});

			showRecorderIndicator();

			console.info('Recording started');
			void playSoundIfEnabled('start-manual');
		},
		onSettled: invalidateRecorderState,
	}));

	const stopRecording = createResultMutation(() => ({
		mutationFn: async ({
			toastId,
		}: {
			toastId: string;
			language: LanguageType;
		}) => {
			const stopResult = await userConfiguredServices.recorder.stopRecording({
				sendStatus: (options) => toast.loading({ id: toastId, ...options }),
			});
			return stopResult;
		},
		onError: (error, { toastId }) => {
			toast.error({ id: toastId, ...error });
		},
		onSuccess: async (blob, { toastId, language }) => {
			toast.success({
				id: toastId,
				title: '🎙️ Recording stopped',
				description: 'Your recording has been saved',
			});
			console.info('Recording stopped');
			void playSoundIfEnabled('stop-manual');

			hideRecorderIndicator();

			closeRecordingSession.mutate(
				{
					sendStatus: (options) => toast.loading({ id: toastId, ...options }),
				},
				{
					onError: (error) => {
						toast.warning({
							id: toastId,
							title: '⚠️ Unable to close session after recording',
							description:
								'You might need to restart the application to continue recording',
							action: {
								type: 'more-details',
								error: error,
							},
						});
					},
				},
			);

			// transcribe.
			const transcribeToastId = nanoid();
			transcriber.transcribeRecording.mutate(
				{
					recording: {
						blob,
					},
					toastId: transcribeToastId,
					language: language,
				},
				{
					onSuccess: (transcribedText) => {
						const output = (text: string) => {
							// if copy to clipboard is enabled, copy the transcription to clipboard
							if (settings.value['transcription.copyToClipboardOnSuccess']) {
								writeTextToClipboard(text);
							}
							if (settings.value['transcription.insertToCursorOnSuccess']) {
								writeTextToCursor(text);
							}
						};

						const config = settings.value['postProcessing.config'];
						if (config.type !== 'none') {
							const transformToastId = nanoid();
							transformer.transform.mutate(
								{
									input: transcribedText,
									config,
									toastId: transformToastId,
								},
								{
									onSuccess: (transformedText) => {
										output(transformedText);
									},
								},
							);
						} else {
							output(transcribedText);
						}
					},
				},
			);
		},
		onSettled: invalidateRecorderState,
	}));

	const ensureRecordingSession = createResultMutation(() => ({
		mutationFn: async (toastId: string) => {
			const ensureRecordingSessionResult =
				await userConfiguredServices.recorder.ensureRecordingSession(
					{
						deviceId: settings.value['recording.selectedAudioInputDeviceId'],
						bitsPerSecond:
							Number(settings.value['recording.bitrateKbps']) * 1000,
					},
					{
						sendStatus: (options) => toast.loading({ id: toastId, ...options }),
					},
				);
			return ensureRecordingSessionResult;
		},
		onSettled: invalidateRecorderState,
	}));

	const closeRecordingSession = createResultMutation(() => ({
		mutationFn: async ({
			sendStatus,
		}: {
			sendStatus: UpdateStatusMessageFn;
		}) => {
			const closeResult =
				await userConfiguredServices.recorder.closeRecordingSession({
					sendStatus,
				});
			return closeResult;
		},
		onSettled: invalidateRecorderState,
	}));

	const cancelRecorder = createResultMutation(() => ({
		mutationFn: async ({ toastId }: { toastId: string }) => {
			const cancelResult =
				await userConfiguredServices.recorder.cancelRecording({
					sendStatus: (options) => toast.loading({ id: toastId, ...options }),
				});
			return cancelResult;
		},
		onError: (error, { toastId }) => {
			toast.error({ id: toastId, ...error });
		},
		onSuccess: async (_data, { toastId }) => {
			closeRecordingSession.mutate(
				{
					sendStatus: (options) => toast.loading({ id: toastId, ...options }),
				},
				{
					onSuccess: () => {
						void playSoundIfEnabled('cancel');
						console.info('Recording cancelled');
					},
					onError: (error) => {
						toast.error({
							id: toastId,
							title: '❌ Failed to close session while cancelling recording',
							description:
								'Your recording was cancelled but we encountered an issue while closing your session. You may need to restart the application.',
							action: { type: 'more-details', error: error },
						});
					},
				},
			);
		},
		onSettled: invalidateRecorderState,
	}));

	return {
		get recorderState() {
			return recorderState.data ?? 'IDLE';
		},
		toggleRecording: async (start: boolean, language?: LanguageType) => {
			const resolvedLanguage = language || 'auto';
			const toastId = nanoid();
			if (start) {
				startRecording.mutate({ toastId });
			} else {
				stopRecording.mutate({ toastId, language: resolvedLanguage });
			}
		},
		cancelRecorderWithToast: () => {
			const toastId = nanoid();
			cancelRecorder.mutate({ toastId });
		},
		closeRecordingSessionSilent: () => {
			const toastId = nanoid();
			closeRecordingSession.mutate(
				{ sendStatus: noop },
				{
					onError: (error) => {
						toast.error({ id: toastId, ...error });
					},
				},
			);
		},
		closeRecordingSessionWithToast: () => {
			const toastId = nanoid();
			return closeRecordingSession.mutate(
				{
					sendStatus: (status) => {
						toast.info({ id: toastId, ...status });
					},
				},
				{
					onError: (error) => {
						toast.error({ id: toastId, ...error });
					},
				},
			);
		},
	};
}
