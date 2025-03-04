import { Ok, tryAsync } from '@epicenterhq/result';
import { WhisperingErr, type WhisperingResult } from '@repo/shared';
import type {
	RecorderService,
	RecordingSessionSettings,
	UpdateStatusMessageFn,
} from './RecorderService';

const TIMESLICE_MS = 1000;
// Whisper API recommends a mono channel at 16kHz
const WHISPER_RECOMMENDED_MEDIA_TRACK_CONSTRAINTS = {
	channelCount: { ideal: 1 },
	sampleRate: { ideal: 16_000 },
} satisfies MediaTrackConstraints;

type RecordingSession = {
	settings: RecordingSessionSettings;
	stream: MediaStream;
	recorder: {
		mediaRecorder: MediaRecorder;
		recordedChunks: Blob[];
		recordingId: string;
	} | null;
};

export function createRecorderServiceWeb(): RecorderService {
	let maybeCurrentSession: RecordingSession | null = null;

	const acquireStream = async (
		settings: RecordingSessionSettings,
		{ sendStatus }: { sendStatus: UpdateStatusMessageFn },
	): Promise<WhisperingResult<MediaStream>> => {
		if (!settings.deviceId) {
			sendStatus({
				title: '🔍 No Device Selected',
				description:
					"No worries! We'll find the best microphone for you automatically...",
			});
			const getFirstStreamResult = await getFirstAvailableStream();
			if (!getFirstStreamResult.ok) {
				return WhisperingErr({
					title: '🚫 Stream Error',
					description:
						"Hmm... We couldn't find any microphones to use. Check your connections and try again!",
					action: { type: 'more-details', error: getFirstStreamResult.error },
				});
			}
			const firstStream = getFirstStreamResult.data;
			return Ok(firstStream);
		}
		sendStatus({
			title: '🎯 Connecting Device',
			description:
				'Almost there! Just need your permission to use the microphone...',
		});
		const getPreferredStreamResult = await getStreamForDeviceId(
			settings.deviceId,
		);
		if (!getPreferredStreamResult.ok) {
			sendStatus({
				title: '⚠️ Finding a New Microphone',
				description:
					"That microphone isn't working. Let's try finding another one...",
			});
			const getFirstStreamResult = await getFirstAvailableStream();
			if (!getFirstStreamResult.ok) {
				return WhisperingErr({
					title: '🎤 No Microphone Found',
					description:
						"We couldn't connect to any microphones. Make sure they're plugged in and try again!",
					action: { type: 'more-details', error: getFirstStreamResult.error },
				});
			}
			const firstStream = getFirstStreamResult.data;
			return Ok(firstStream);
		}
		const preferredStream = getPreferredStreamResult.data;
		return Ok(preferredStream);
	};

	return {
		getRecorderState: () => {
			if (!maybeCurrentSession) return Ok('IDLE');
			if (maybeCurrentSession.recorder) return Ok('SESSION+RECORDING');
			return Ok('SESSION');
		},
		enumerateRecordingDevices,

		ensureRecordingSession: async (settings, { sendStatus }) => {
			if (maybeCurrentSession) return Ok(undefined);
			const acquireStreamResult = await acquireStream(settings, {
				sendStatus,
			});
			if (!acquireStreamResult.ok) return acquireStreamResult;
			const stream = acquireStreamResult.data;
			maybeCurrentSession = { settings, stream, recorder: null };
			return Ok(undefined);
		},

		closeRecordingSession: async ({ sendStatus }) => {
			if (!maybeCurrentSession) return Ok(undefined);
			const currentSession = maybeCurrentSession;
			sendStatus({
				title: '🎙️ Cleaning Up',
				description:
					'Safely stopping your audio stream to free up system resources...',
			});
			for (const track of currentSession.stream.getTracks()) {
				track.stop();
			}
			sendStatus({
				title: '🧹 Almost Done',
				description:
					'Cleaning up recording resources and preparing for next session...',
			});
			maybeCurrentSession.recorder = null;
			sendStatus({
				title: '✨ All Set',
				description:
					'Recording session successfully closed and resources freed',
			});
			maybeCurrentSession = null;
			return Ok(undefined);
		},

		startRecording: async (recordingId, { sendStatus }) => {
			if (!maybeCurrentSession) {
				return WhisperingErr({
					title: '🚫 No Active Session',
					description:
						'Looks like we need to start a new recording session first!',
				});
			}
			const currentSession = maybeCurrentSession;
			if (!currentSession.stream.active) {
				sendStatus({
					title: '🔄 Session Expired',
					description:
						'Your recording session timed out. Reconnecting to your microphone...',
				});
				const acquireStreamResult = await acquireStream(
					currentSession.settings,
					{ sendStatus },
				);
				if (!acquireStreamResult.ok) return acquireStreamResult;
				const stream = acquireStreamResult.data;
				maybeCurrentSession = {
					settings: currentSession.settings,
					stream,
					recorder: null,
				};
			}
			sendStatus({
				title: '🎯 Getting Ready',
				description: 'Initializing your microphone and preparing to record...',
			});
			const newRecorderResult = await tryAsync({
				try: async () => {
					return new MediaRecorder(currentSession.stream, {
						bitsPerSecond: currentSession.settings.bitsPerSecond,
					});
				},
				mapErr: (error) =>
					WhisperingErr({
						title: '🎙️ Setup Failed',
						description:
							"Oops! Something went wrong with your microphone. Let's try that again!",
						action: { type: 'more-details', error },
					}),
			});
			if (!newRecorderResult.ok) return newRecorderResult;
			const newRecorder = newRecorderResult.data;
			sendStatus({
				title: '🎤 Recording Active',
				description:
					'Your microphone is now recording. Speak clearly and naturally!',
			});
			maybeCurrentSession.recorder = {
				mediaRecorder: newRecorder,
				recordedChunks: [],
				recordingId,
			};
			newRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
				if (!event.data.size) return;
				maybeCurrentSession?.recorder?.recordedChunks.push(event.data);
			});
			newRecorder.start(TIMESLICE_MS);
			return Ok(undefined);
		},

		stopRecording: async ({ sendStatus }) => {
			if (!maybeCurrentSession?.recorder) {
				return WhisperingErr({
					title: '⚠️ Nothing to Stop',
					description: 'No active recording found to stop',
					action: { type: 'more-details', error: undefined },
				});
			}
			const recorder = maybeCurrentSession.recorder;
			sendStatus({
				title: '⏸️ Finishing Up',
				description:
					'Saving your recording and preparing the final audio file...',
			});
			const stopResult = await tryAsync({
				try: () =>
					new Promise<Blob>((resolve) => {
						recorder.mediaRecorder.addEventListener('stop', () => {
							const audioBlob = new Blob(recorder.recordedChunks, {
								type: recorder.mediaRecorder.mimeType,
							});
							resolve(audioBlob);
						});
						recorder.mediaRecorder.stop();
					}),
				mapErr: (error) =>
					WhisperingErr({
						title: '⏹️ Recording Stop Failed',
						description: 'Unable to save your recording. Please try again',
						action: { type: 'more-details', error },
					}),
			});
			if (!stopResult.ok) return stopResult;
			sendStatus({
				title: '✅ Recording Complete',
				description: 'Successfully saved your audio recording!',
			});
			const blob = stopResult.data;
			maybeCurrentSession.recorder = null;
			return Ok(blob);
		},

		cancelRecording: async ({ sendStatus }) => {
			if (!maybeCurrentSession?.recorder) {
				return WhisperingErr({
					title: '⚠️ Nothing to Cancel',
					description: 'No active recording found to cancel',
					action: { type: 'more-details', error: undefined },
				});
			}
			const recorder = maybeCurrentSession.recorder;
			sendStatus({
				title: '🛑 Cancelling',
				description: 'Safely cancelling your recording...',
			});
			recorder.mediaRecorder.stop();
			sendStatus({
				title: '✨ Cancelled',
				description: 'Recording successfully cancelled!',
			});
			maybeCurrentSession.recorder = null;
			return Ok(undefined);
		},
	};
}

async function getFirstAvailableStream() {
	const enumerateDevicesResult = await enumerateRecordingDevices();
	if (!enumerateDevicesResult.ok)
		return WhisperingErr({
			title:
				'Error enumerating recording devices and acquiring first available stream',
			description:
				'Please make sure you have given permission to access your audio devices',
			action: { type: 'more-details', error: enumerateDevicesResult.error },
		});
	const recordingDevices = enumerateDevicesResult.data;
	for (const device of recordingDevices) {
		const streamResult = await getStreamForDeviceId(device.deviceId);
		if (streamResult.ok) {
			return streamResult;
		}
	}
	return WhisperingErr({
		title: '🎤 Microphone Access Error',
		description: 'Unable to connect to your selected microphone',
		action: { type: 'more-details', error: undefined },
	});
}

async function enumerateRecordingDevices() {
	return tryAsync({
		try: async () => {
			const allAudioDevicesStream = await navigator.mediaDevices.getUserMedia({
				audio: WHISPER_RECOMMENDED_MEDIA_TRACK_CONSTRAINTS,
			});
			const devices = await navigator.mediaDevices.enumerateDevices();
			for (const track of allAudioDevicesStream.getTracks()) {
				track.stop();
			}
			const audioInputDevices = devices.filter(
				(device) => device.kind === 'audioinput',
			);
			return audioInputDevices;
		},
		mapErr: (error) =>
			WhisperingErr({
				title: '🎤 Device Access Error',
				description:
					'Oops! We need permission to see your microphones. Check your browser settings and try again!',
				action: { type: 'more-details', error },
			}),
	});
}

async function getStreamForDeviceId(recordingDeviceId: string) {
	return tryAsync({
		try: async () => {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					...WHISPER_RECOMMENDED_MEDIA_TRACK_CONSTRAINTS,
					deviceId: { exact: recordingDeviceId },
				},
			});
			return stream;
		},
		mapErr: (error) =>
			WhisperingErr({
				title: '🎤 Microphone Access Error',
				description: 'Unable to connect to your selected microphone',
				action: { type: 'more-details', error },
			}),
	});
}
