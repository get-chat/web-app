import React from 'react';
import {
	extractFailedWaIds,
	getFirstFailedPendingMessage,
	setAllFailedPendingMessagesWillRetry,
} from '@src/helpers/PendingMessagesHelper';
import { Alert } from '@src/components/ui/alert';
import { cn } from '@src/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import Moment from 'react-moment';
import { CHAT_KEY_PREFIX } from '@src/Constants';
import { Trans, useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setPendingMessages } from '@src/store/reducers/pendingMessagesReducer';
import { ChatList } from '@src/types/chats';
import { getChatContactName } from '@src/helpers/ChatHelper';
import { getChatPath } from '@src/helpers/RouteHelper';

interface Props {
	contactProvidersData: { [key: string]: any };
	chats: ChatList;
	isSendingPendingMessages: boolean;
}

const RetryFailedMessages: React.FC<Props> = ({
	contactProvidersData,
	chats,
	isSendingPendingMessages,
}) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const { lastSendAttemptAt } = useAppSelector((state) => state.UI);
	const pendingMessages = useAppSelector(
		(state) => state.pendingMessages.value
	);

	const navigate = useNavigate();
	const location = useLocation();

	const dateFormat = 'H:mm';

	const resendMessage = () => {
		// Set all failed pending message as willRetry so queue will retry automatically
		dispatch(
			setPendingMessages(setAllFailedPendingMessagesWillRetry(pendingMessages))
		);

		// Switch to chat of first failed message
		const firstFailedMessage = getFirstFailedPendingMessage(pendingMessages);
		const waId = firstFailedMessage?.requestBody?.wa_id;
		if (waId) {
			navigate(`${getChatPath(waId)}${location.search}`);
		}
	};

	const generateFailedReceiversString = () => {
		const failedWaIds = extractFailedWaIds(pendingMessages);
		let namesArray: string[] = [];
		failedWaIds.forEach((waId) => {
			const name =
				contactProvidersData[waId]?.[0]?.name ??
				getChatContactName(chats[CHAT_KEY_PREFIX + waId]);
			namesArray.push(name ?? waId);
		});

		return namesArray.join(', ');
	};

	return (
		<div className="flex flex-col">
			<Alert
				severity="error"
				className={cn('rounded-none', isSendingPendingMessages && 'opacity-50')}
			>
				Failed to send messages to {generateFailedReceiversString()}.
				<br />
				<a href="#" className="self-start" onClick={resendMessage}>
					{t('Click to retry.')}
				</a>
				<br />
				{lastSendAttemptAt && (
					<div className="mt-2.5 text-[12px] opacity-80">
						<Trans>
							Last attempt at:{' '}
							<Moment date={lastSendAttemptAt} format={dateFormat} />
						</Trans>
					</div>
				)}
			</Alert>
		</div>
	);
};

export default RetryFailedMessages;
