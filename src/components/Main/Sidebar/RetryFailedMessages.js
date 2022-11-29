import React from 'react';
import {
	extractFailedWaIds,
	getFirstFailedPendingMessage,
	setAllFailedPendingMessagesWillRetry,
} from '../../../helpers/PendingMessagesHelper';
import '../../../styles/RetryFailedMessages.css';
import { Alert } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import Moment from 'react-moment';
import { CHAT_KEY_PREFIX } from '../../../Constants';
import { Trans, useTranslation } from 'react-i18next';

function RetryFailedMessages(props) {
	const { t } = useTranslation();

	const navigate = useNavigate();

	const dateFormat = 'H:mm';

	const resendMessage = () => {
		// Set all failed pending message as willRetry so queue will retry automatically
		props.setPendingMessages([...setAllFailedPendingMessagesWillRetry()]);

		// Switch to chat of first failed message
		const firstFailedMessage = getFirstFailedPendingMessage(
			props.pendingMessages
		);
		const waId = firstFailedMessage.requestBody?.wa_id;
		if (waId) {
			navigate(`/main/chat/${waId}`);
		}
	};

	const generateFailedReceiversString = () => {
		const failedWaIds = extractFailedWaIds(props.pendingMessages);
		let namesArray = [];
		failedWaIds.forEach((waId) => {
			const name =
				props.contactProvidersData[waId]?.[0]?.name ??
				props.chats[CHAT_KEY_PREFIX + waId]?.name;
			namesArray.push(name ?? waId);
		});

		return namesArray.join(', ');
	};

	return (
		<div className="retryFailedMessagesWrapper">
			<Alert
				className={
					'retryFailedMessages' +
					(props.isSendingPendingMessages ? ' sending' : '')
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
				{props.lastSendAttemptAt && (
					<div className="retryFailedMessages__lastSendAttemptAt">
						<Trans>
							Last attempt at:{' '}
							<Moment date={props.lastSendAttemptAt} format={dateFormat} />
						</Trans>
					</div>
				)}
			</Alert>
		</div>
	);
}

export default RetryFailedMessages;
