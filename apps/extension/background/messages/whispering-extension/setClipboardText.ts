import type { PlasmoMessaging } from '@plasmohq/messaging';
import { WhisperingErr, type WhisperingResult } from '@repo/shared';
import { injectScript } from '~background/injectScript';
import { getActiveTabId } from '~lib/getActiveTabId';
import { whisperingStorage } from '~lib/storage/whisperingStorage';

const handler: PlasmoMessaging.MessageHandler<
	{ transcribedText: string },
	WhisperingResult<string>
> = async ({ body }, res) => {
	const setClipboardText = async (): Promise<WhisperingResult<string>> => {
		if (!body?.transcribedText) {
			return WhisperingErr({
				title: 'Unable to copy transcribed text to clipboard',
				description: 'Text must be provided in the request body of the message',
			});
		}

		const getActiveTabIdResult = await getActiveTabId();
		if (!getActiveTabIdResult.ok) {
			return WhisperingErr({
				title: 'Unable to copy transcribed text to clipboard',
				description:
					'Please go to your recordings tab in the Whispering website to copy the transcribed text to clipboard',
				action: { type: 'more-details', error: getActiveTabIdResult.error },
			});
		}
		const activeTabId = getActiveTabIdResult.data;
		if (!activeTabId) {
			return WhisperingErr({
				title: 'Unable to copy transcribed text to clipboard',
				description: 'No active tab ID found',
			});
		}

		whisperingStorage.setItem(
			'whispering-latest-recording-transcribed-text',
			body.transcribedText,
		);

		const injectScriptResult = await injectScript<string, [string]>({
			tabId: activeTabId,
			commandName: 'setClipboardText',
			func: (text) => {
				try {
					navigator.clipboard.writeText(text);
					return { ok: true, data: text } as const;
				} catch (error) {
					return {
						ok: false,
						error: {
							_tag: 'WhisperingError',
							variant: 'error',
							title:
								'Unable to copy transcribed text to clipboard in active tab',
							description:
								'There was an error writing to the clipboard using the browser Clipboard API. Please try again.',
							action: { type: 'more-details', error },
						},
					} as const;
				}
			},
			args: [body.transcribedText],
		});
		return injectScriptResult;
	};
	res.send(await setClipboardText());
};
export default handler;
