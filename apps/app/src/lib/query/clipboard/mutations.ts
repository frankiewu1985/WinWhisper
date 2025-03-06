import { ClipboardService } from '$lib/services';
import { toast } from '$lib/services/toast';
import { createMutation } from '@epicenterhq/result';

export type CopyToClipboardLabel =
	| 'transcribed text'
	| 'transcribed text (joined)'
	| 'transformed text'
	| 'code'
	| 'latest transformation run output';

export const copyTextToClipboardWithToast = createMutation({
	mutationFn: async ({
		text,
	}: {
		label: CopyToClipboardLabel;
		text: string;
	}) => {
		const copyResult = await ClipboardService.setClipboardText(text);
		return copyResult;
	},
	onError: (error, { input: { label } }) => {
		toast.error({
			title: `Error copying ${label} to clipboard`,
			description: error.description,
		});
	},
});
