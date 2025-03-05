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
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { LogicalPosition, LogicalSize } from '@tauri-apps/api/window';
import type { LanguageType } from '$lib/services/transcription/TranscriptionService';

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

	let recorderIndicatorWindow: WebviewWindow | null = null;
	const showRecorderIndicator = () => {
		if (!recorderIndicatorWindow) {
			try {
				// Get the screen size
				const screenSize = window.screen;
				const screenWidth = screenSize.width;
				const screenHeight = screenSize.height;

				// Calculate the position for the bottom center
				const windowWidth = 120;
				const windowHeight = 60;
				const x = (screenWidth - windowWidth) / 2;
				const y = screenHeight - windowHeight - 150;

				// Open a new Tauri window in hidden mode
				recorderIndicatorWindow = new WebviewWindow('recording', {
					url: 'recording.html',
					resizable: false,
					decorations: false,
					transparent: true,
					alwaysOnTop: true,
					visible: false,
					shadow: false,
					skipTaskbar: true,
				});

				// Set the position of the window
				recorderIndicatorWindow.setSize(
					new LogicalSize(windowWidth, windowHeight),
				);
				recorderIndicatorWindow.setPosition(new LogicalPosition(x, y));

				recorderIndicatorWindow.once('tauri://created', () => {
					console.log('Recorder indicator window created successfully');
				});

				recorderIndicatorWindow.once('tauri://error', (e) => {
					console.error('Failed to create recorder indicator window', e);
				});
			} catch (error) {
				console.error('Error creating recorder indicator window:', error);
			}
		}

		recorderIndicatorWindow!
			.show()
			.then(() => {
				console.log('Recorder indicator window shown successfully');
			})
			.catch((error) => {
				console.error('Error showing recorder indicator window:', error);
			});
	};

	const hideRecorderIndicator = () => {
		if (recorderIndicatorWindow) {
			recorderIndicatorWindow
				.hide()
				.then(() => {
					console.log('Recorder indicator window hidden successfully');
				})
				.catch((error) => {
					console.error('Error hiding recorder indicator window:', error);
				});
		} else {
			console.log('No recorder indicator window to hide');
		}
	};

	const startRecording = createResultMutation(() => ({
		onMutate: async ({ toastId }) => {
			toast.loading({
				id: toastId,
				title: '🎙️ Preparing to record...',
				description: 'Setting up your recording environment...',
			});
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
				title: '🎙️ Whispering is recording...',
				description: 'Speak now and stop recording when done',
			});

			showRecorderIndicator();

			console.info('Recording started');
			void playSoundIfEnabled('start-manual');
		},
		onSettled: invalidateRecorderState,
	}));

	const stopRecording = createResultMutation(() => ({
		onMutate: ({ toastId }) => {
			toast.loading({
				id: toastId,
				title: '⏸️ Stopping recording...',
				description: 'Finalizing your audio capture...',
			});
		},
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

			if (!settings.value['recording.isFasterRerecordEnabled']) {
				toast.loading({
					id: toastId,
					title: '⏳ Closing recording session...',
					description: 'Wrapping things up, just a moment...',
				});
				closeRecordingSession.mutate(
					{
						sendStatus: (options) => toast.loading({ id: toastId, ...options }),
					},
					{
						onSuccess: async () => {
							toast.success({
								id: toastId,
								title: '✨ Session Closed Successfully',
								description:
									'Your recording session has been neatly wrapped up',
							});
						},
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
			}

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
						const transformStep = settings.value['postProcessing.config'];
						if (transformStep.type !== 'none') {
							const transformToastId = nanoid();
							transformer.transformStep.mutate({
								input: transcribedText,
								transformationStep: transformStep,
								toastId: transformToastId,
							});
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
		onMutate: ({ toastId }: { toastId: string }) => {
			toast.loading({
				id: toastId,
				title: '⏸️ Canceling recording...',
				description: 'Cleaning up recording session...',
			});
		},
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
			if (settings.value['recording.isFasterRerecordEnabled']) {
				toast.success({
					id: toastId,
					title: '🚫 Recording Cancelled',
					description:
						'Recording discarded, but session remains open for a new take',
				});
			} else {
				closeRecordingSession.mutate(
					{
						sendStatus: (options) => toast.loading({ id: toastId, ...options }),
					},
					{
						onSuccess: () => {
							toast.success({
								id: toastId,
								title: '✅ All Done!',
								description:
									'Recording cancelled and session closed successfully',
							});
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
			}
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
