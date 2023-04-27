import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import SendTemplateMessage from '@src/components/SendTemplateDialog/SendTemplateMessage';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import DialogActions from '@mui/material/DialogActions';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { useTranslation } from 'react-i18next';
import TemplateModel from '@src/api/models/TemplateModel';
import { generateTemplateMessagePayload } from '@src/helpers/ChatHelper';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import PubSub from 'pubsub-js';
import {
	EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
	EVENT_TOPIC_SENT_TEMPLATE_MESSAGE,
} from '@src/Constants';

export type Props = {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
	chosenTemplate?: TemplateModel;
	onSend: (template: TemplateModel) => void;
	sendCallback?: () => void;
	onBulkSend: (type: string, payload: {}) => void;
	isBulkOnly: boolean;
	selectTemplateCallback?: () => void;
};

const SendTemplateDialog: React.FC<Props> = ({
	isVisible,
	setVisible,
	chosenTemplate,
	onSend,
	sendCallback,
	onBulkSend,
	isBulkOnly,
	selectTemplateCallback,
}) => {
	const { t } = useTranslation();

	const [isSending, setSending] = useState(false);
	const [errors, setErrors] = useState<[]>();
	const [sentTemplateMessage, setSentTemplateMessage] =
		useState<TemplateModel>();

	const dialogContentRef = useRef<HTMLDivElement>();
	const sendButtonRef = useRef<HTMLButtonElement>();
	const bulkSendButtonRef = useRef<HTMLButtonElement>();

	useEffect(() => {
		if (!isVisible) {
			setErrors(undefined);
		}
	}, [isVisible]);

	useEffect(() => {
		const onSendTemplateMessageError = function (msg: any, data: any) {
			setErrors(data);
			setSending(false);

			// Scroll to bottom
			if (dialogContentRef.current) {
				dialogContentRef.current.scrollTop =
					dialogContentRef.current.scrollHeight;
			}
		};

		const sendTemplateMessageErrorEventToken = PubSub.subscribe(
			EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
			onSendTemplateMessageError
		);

		const onSentTemplateMessage = function (msg: any, data: any) {
			// Remove injected fields
			delete data.wa_id;
			delete data.pendingMessageUniqueId;

			// Check if sent message is equal to current pending one
			if (
				sentTemplateMessage !== undefined &&
				JSON.stringify(data) ===
					JSON.stringify(generateTemplateMessagePayload(sentTemplateMessage))
			) {
				close();
				setSending(false);
			}
		};

		const sentTemplateMessageEventToken = PubSub.subscribe(
			EVENT_TOPIC_SENT_TEMPLATE_MESSAGE,
			onSentTemplateMessage
		);

		return () => {
			PubSub.unsubscribe(sendTemplateMessageErrorEventToken);
			PubSub.unsubscribe(sentTemplateMessageEventToken);
		};
	}, [dialogContentRef.current, sentTemplateMessage]);

	const close = () => {
		setVisible(false);
	};

	const bulkSend = (template: TemplateModel) => {
		const payload = generateTemplateMessagePayload(template ?? chosenTemplate);
		onBulkSend(ChatMessageModel.TYPE_TEMPLATE, payload);
		sendCallback?.();
		close();
	};

	const sendByRef = () => {
		setSending(true);
		sendButtonRef.current?.click();

		selectTemplateCallback?.();
	};

	const bulkSendByRef = () => {
		bulkSendButtonRef.current?.click();
	};

	const sendAction = (template: TemplateModel) => {
		const messageToBeSent = template ?? chosenTemplate;
		setSentTemplateMessage(messageToBeSent);
		onSend(messageToBeSent);
		sendCallback?.();
	};

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>{t('Send a template message')}</DialogTitle>
			<DialogContent ref={dialogContentRef}>
				<SendTemplateMessage
					data={chosenTemplate}
					send={(template: TemplateModel) => sendAction(template)}
					setSending={setSending}
					setErrors={setErrors}
					bulkSend={bulkSend}
					sendButtonInnerRef={sendButtonRef}
					bulkSendButtonInnerRef={bulkSendButtonRef}
				/>

				{errors && (
					<div className="templateMessagesDialogErrors">
						{errors.map((err: any, index) => (
							<Alert key={index} severity="error">
								<AlertTitle>{err.title}</AlertTitle>
								{err.details}
							</Alert>
						))}
					</div>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				{!isBulkOnly && (
					<Button
						onClick={sendByRef}
						color="primary"
						disabled={isSending}
						autoFocus
						data-test-id="send-template-message-button"
					>
						{t('Send')}
					</Button>
				)}
				<Button
					onClick={bulkSendByRef}
					color="primary"
					disabled={isSending}
					autoFocus
				>
					{t('Bulk send')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SendTemplateDialog;
