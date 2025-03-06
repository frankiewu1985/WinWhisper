import { dev } from '$app/environment';
import { notificationLog } from '$lib/components/NotificationLog.svelte';
import type { ToastAndNotifyOptions } from '@repo/shared';
import { toast as sonnerToast } from 'svelte-sonner';

export const toast = createToastService();

// const isFocused = async () => {
// 	const isDocumentFocused = document.hasFocus();
// 	const isWindowFocused = await getCurrentWindow().isFocused();
// 	return isWindowFocused && isDocumentFocused;
// };

function createToastService() {
	const createToastFn =
		(toastVariant: ToastAndNotifyOptions['variant']) =>
		(toastOptions: Omit<ToastAndNotifyOptions, 'variant'>) => {
			// const getDurationInMs = () => {
			// 	if (toastVariant === 'loading') return 5000;
			// 	if (toastVariant === 'error' || toastVariant === 'warning') return 5000;
			// 	if (toastOptions.action) return 4000;
			// 	return 3000;
			// };

			// const durationInMs = getDurationInMs();

			notificationLog.addLog({ variant: toastVariant, ...toastOptions });

			if (dev) {
				switch (toastVariant) {
					case 'error':
						console.error('[Toast]', toastOptions);
						break;
					case 'warning':
						console.warn('[Toast]', toastOptions);
						break;
					case 'info':
						console.info('[Toast]', toastOptions);
						break;
					case 'loading':
						console.info('[Toast]', toastOptions);
						break;
					case 'success':
						console.log('[Toast]', toastOptions);
						break;
				}
			}

			// const { title, action, ...options } = toastOptions;
			// const id = sonnerToast[toastVariant](title, {
			// 	...options,
			// 	duration: durationInMs,
			// 	action: convertActionToToastAction(action),
			// });
			// return String(id);
		};

	return {
		success: createToastFn('success'),
		info: createToastFn('info'),
		loading: createToastFn('loading'),
		error: createToastFn('error'),
		warning: createToastFn('warning'),
		dismiss: sonnerToast.dismiss,
	};
}

// function convertActionToToastAction(action: ToastAndNotifyOptions['action']) {
// 	switch (action?.type) {
// 		case 'link':
// 			return {
// 				label: action.label,
// 				onClick: () => goto(action.goto),
// 			};
// 		case 'more-details':
// 			return {
// 				label: 'More details',
// 				onClick: () =>
// 					moreDetailsDialog.open({
// 						title: 'More details',
// 						description: 'The following is the raw error message.',
// 						content: action.error,
// 					}),
// 			};
// 		default:
// 			return undefined;
// 	}
// }
