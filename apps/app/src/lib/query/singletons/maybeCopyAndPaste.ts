import { ClipboardService } from '$lib/services';
import { toast } from '$lib/services/toast';

export async function writeTextToCursor(text: string) {
	// write text to the current cursor.
	return await ClipboardService.writeTextToCursor(text);
}

export async function writeTextToClipboard(text: string) {
	const copyResult = await ClipboardService.setClipboardText(text);
	if (!copyResult.ok) {
		toast.warning(copyResult.error);
		return;
	}
	return copyResult;
}
