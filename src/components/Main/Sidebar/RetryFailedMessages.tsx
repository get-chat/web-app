import React from 'react';
import {
	extractFailedWaIds,
	getFirstFailedPendingMessage,
	setAllFailedPendingMessagesWillRetry,
} from '@src/helpers/PendingMessagesHelper';
import '../../../styles/RetryFailedMessages.css';
import Alert from '@mui/material/Alert';
import { useLocation, useNavigate } from 'react-router-dom';
import Moment from 'react-moment';
import { CHAT_KEY_PREFIX } from '@src/Constants';
import { Trans, useTranslation } from 'react-i18next';
import PendingMessage from '@src/interfaces/PendingMessage';
import ChatList from '@src/interfaces/ChatList';

interface Props {
	pendingMessages: PendingMessage[];
	setPendingMessages: (value: PendingMessage[]) => void;
	contactProvidersData: { [key: string]: any };
	chats: ChatList;
	isSendingPendingMessages: boolean;
	lastSendAttemptAt: Date | string | number;
}

const RetryFailedMessages: React.FC<Props> = ({
	pendingMessages,
	setPendingMessages,
	contactProvidersData,
	chats,
	isSendingPendingMessages,
	lastSendAttemptAt,
}) => {
	const { t } = useTranslation();

	const navigate = useNavigate();
	const location = useLocation();

	const dateFormat = 'H:mm';

	const resendMessage = () => {
		// Set all failed pending message as willRetry so queue will retry automatically
		setPendingMessages([...setAllFailedPendingMessagesWillRetry()]);

		// Switch to chat of first failed message
		const firstFailedMessage = getFirstFailedPendingMessage(pendingMessages);
		const waId = firstFailedMessage.requestBody?.wa_id;
		if (waId) {
			navigate(`/main/chat/${waId}${location.search}`);
		}
	};

	const generateFailedReceiversString = () => {
		const failedWaIds = extractFailedWaIds(pendingMessages);
		let namesArray: string[] = [];
		failedWaIds.forEach((waId) => {
			const name =
				contactProvidersData[waId]?.[0]?.name ??
				chats[CHAT_KEY_PREFIX + waId]?.name;
			namesArray.push(name ?? waId);
		});

		return namesArray.join(', ');
	};

	return (
		<div className="retryFailedMessagesWrapper">
			<Alert
				className={
					'retryFailedMessages' + (isSendingPendingMessages ? ' sending' : '')
				}
				severity="error"
				elevation={0}
			>
				Failed to send messages to {generateFailedReceiversString()}.
				<br />
				<a href="#" className="bold" onClick={resendMessage}>
					{t('Click to retry.')}
				</a>
				<br />
				{lastSendAttemptAt && (
					<div className="retryFailedMessages__lastSendAttemptAt">
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
