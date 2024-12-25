import type { PlasmoMessaging } from '@plasmohq/messaging';
import type { ToastAndNotifyOptions, WhisperingResult } from '@repo/shared';
import { WhisperingErr } from '@repo/shared';
import { NotificationServiceBgswLive } from '~lib/services/NotificationServiceBgswLive';

const handler: PlasmoMessaging.MessageHandler<
	{ notifyOptions: ToastAndNotifyOptions },
	WhisperingResult<string>
> = async ({ body }, res) => {
	const createNotification = async (): Promise<WhisperingResult<string>> => {
		if (!body?.notifyOptions) {
			return WhisperingErr({
				title: 'Error invoking notify command',
				description:
					'ToastOptions must be provided in the request body of the message',
			});
		}
		const notifyResult = await NotificationServiceBgswLive.notify(
			body.notifyOptions,
		);
		return notifyResult;
	};
	res.send(await createNotification());
};

export default handler;
