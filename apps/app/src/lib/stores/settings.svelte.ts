import type { Recorder } from '$lib/query/singletons/recorder';
import { toast } from '$lib/services/toast';
import { createJobQueue } from '$lib/utils/createJobQueue';
import { createPersistedState } from '$lib/utils/createPersistedState.svelte';
import { tryAsync, trySync } from '@epicenterhq/result';
import {
	WhisperingErr,
	getDefaultSettings,
	settingsSchema,
} from '@repo/shared';
import type { ShortcutEvent } from '@tauri-apps/plugin-global-shortcut';
import hotkeys from 'hotkeys-js';
import { getContext, setContext } from 'svelte';

export const settings = createPersistedState({
	key: 'whispering-settings',
	schema: settingsSchema,
	defaultValue: getDefaultSettings(),
	onUpdateSuccess: () => {
		toast.success({ title: 'Settings updated!', description: '' });
	},
	onUpdateError: (err) => {
		toast.error({
			title: 'Error updating settings',
			description: err instanceof Error ? err.message : 'Unknown error',
		});
	},
});

type RegisterShortcutJob = Promise<void>;

export const initRegisterShortcutsInContext = ({
	recorder,
}: {
	recorder: Recorder;
}) => {
	setContext('registerShortcuts', createRegisterShortcuts({ recorder }));
};

export const getRegisterShortcutsFromContext = () => {
	return getContext<ReturnType<typeof createRegisterShortcuts>>(
		'registerShortcuts',
	);
};

function createRegisterShortcuts({ recorder }: { recorder: Recorder }) {
	const jobQueue = createJobQueue<RegisterShortcutJob>();

	const initialSilentJob = async () => {
		unregisterAllLocalShortcuts();
		await unregisterAllGlobalShortcuts();
		registerLocalShortcut({
			shortcut: settings.value['shortcuts.currentLocalShortcut'],
			callback: (action) => {
				recorder.toggleRecording(action === 'Pressed');
			},
		});
		await registerGlobalShortcut({
			shortcut: settings.value['shortcuts.currentGlobalShortcut'],
			callback: (action) => {
				recorder.toggleRecording(action === 'Pressed');
			},
		});
		await registerGlobalShortcut({
			shortcut: settings.value['shortcuts.currentGlobalShortcut1'],
			callback: (action) => {
				recorder.toggleRecording(action === 'Pressed', settings.value['transcription.outputLanguage1']);
			},
		});
		await registerGlobalShortcut({
			shortcut: settings.value['shortcuts.currentGlobalShortcut2'],
			callback: (action) => {
				recorder.toggleRecording(action === 'Pressed', settings.value['transcription.outputLanguage2']);
			},
		});
		await registerGlobalShortcut({
			shortcut: settings.value['shortcuts.currentGlobalShortcut3'],
			callback: (action) => {
				recorder.toggleRecording(action === 'Pressed', settings.value['transcription.outputLanguage3']);
			},
		});
	};

	jobQueue.addJobToQueue(initialSilentJob());

	return {
		registerLocalShortcut: ({
			shortcut,
			callback,
		}: {
			shortcut: string;
			callback: (action: 'Pressed' | 'Released') => void;
		}) => {
			const job = async () => {
				unregisterAllLocalShortcuts();
				registerLocalShortcut({ shortcut, callback });
				toast.success({
					title: `Local shortcut set to ${shortcut}`,
					description: 'Press the shortcut to start recording',
				});
			};
			jobQueue.addJobToQueue(job());
		},
		registerGlobalShortcut: ({
			shortcut,
			callback,
		}: {
			shortcut: string;
			callback: (action: 'Pressed' | 'Released') => void;
		}) => {
			const job = async () => {
				unregisterGlobalShortcut(shortcut);
				await registerGlobalShortcut({ shortcut, callback });
				toast.success({
					title: `Global shortcut set to ${shortcut}`,
					description: 'Press the shortcut to start recording',
				});
			};
			jobQueue.addJobToQueue(job());
		},
	};
}

function unregisterAllLocalShortcuts() {
	return trySync({
		try: () => hotkeys.unbind(),
		mapErr: (error) =>
			WhisperingErr({
				title: 'Error unregistering all shortcuts',
				description: 'Please try again.',
				action: { type: 'more-details', error },
			}),
	});
}

function unregisterAllGlobalShortcuts() {
	return tryAsync({
		try: async () => {
			const { unregisterAll } = await import(
				'@tauri-apps/plugin-global-shortcut'
			);
			return await unregisterAll();
		},
		mapErr: (error) =>
			WhisperingErr({
				title: 'Error unregistering all shortcuts',
				description: 'Please try again.',
				action: { type: 'more-details', error },
			}),
	});
}

function unregisterGlobalShortcut(shortcut: string) {
	return tryAsync({
		try: async () => {
			const { unregister } = await import(
				'@tauri-apps/plugin-global-shortcut'
			);
			return await unregister(shortcut);
		},
		mapErr: (error) =>
			WhisperingErr({
				title: 'Error unregistering all shortcuts',
				description: 'Please try again.',
				action: { type: 'more-details', error },
			}),
	});
}

function registerLocalShortcut({
	shortcut,
	callback,
}: {
	shortcut: string;
	callback: (action: 'Pressed' | 'Released') => void;
}) {
	const unregisterAllLocalShortcutsResult = unregisterAllLocalShortcuts();
	if (!unregisterAllLocalShortcutsResult.ok)
		return unregisterAllLocalShortcutsResult;
	return trySync({
		try: () =>
			hotkeys(shortcut, (event) => {
				// check if the event is pressed or released.
				const action =
					event.type === 'keydown'
						? 'Pressed'
						: event.type === 'keyup'
							? 'Released'
							: undefined;
				if (action) {
					// Prevent the default refresh event under WINDOWS system
					event.preventDefault();
					callback(action);
				}
			}),
		mapErr: (error) =>
			WhisperingErr({
				title: 'Error registering local shortcut',
				description: 'Please make sure it is a valid keyboard shortcut.',
				action: { type: 'more-details', error },
			}),
	});
}

async function registerGlobalShortcut({
	shortcut,
	callback,
}: {
	shortcut: string;
	callback: (action: 'Pressed' | 'Released') => void;
}) {
	await unregisterGlobalShortcut(shortcut);
	return tryAsync({
		try: async () => {
			const { register } = await import('@tauri-apps/plugin-global-shortcut');
			return await register(shortcut, (event: ShortcutEvent) => {
				if (event.state === 'Pressed' || event.state === 'Released') {
					callback(event.state);
				}
			});
		},
		mapErr: (error) =>
			WhisperingErr({
				title: 'Error registering global shortcut.',
				description:
					'Please make sure it is a valid Electron keyboard shortcut.',
				action: { type: 'more-details', error },
			}),
	});
}
