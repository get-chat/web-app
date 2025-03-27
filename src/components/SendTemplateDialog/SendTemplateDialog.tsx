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
import { generateTemplateMessagePayload } from '@src/helpers/ChatHelper';
import PubSub from 'pubsub-js';
import {
	EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
	EVENT_TOPIC_SENT_TEMPLATE_MESSAGE,
} from '@src/Constants';
import { Template } from '@src/types/templates';
import { CreateMessageRequest, MessageType } from '@src/types/messages';

export type Props = {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
	chosenTemplate?: Template;
	onSend: (template: Template) => void;
	sendCallback?: () => void;
	selectTemplateCallback?: () => void;
};

const SendTemplateDialog: React.FC<Props> = ({
	isVisible,
	setVisible,
	chosenTemplate,
	onSend,
	sendCallback,
	selectTemplateCallback,
}) => {
	const { t } = useTranslation();

	const [isSending, setSending] = useState(false);
	const [errors, setErrors] = useState<string[]>();
	const [sentTemplateMessage, setSentTemplateMessage] = useState<Template>();

	const dialogContentRef = useRef<HTMLDivElement>();
	const sendButtonRef = useRef<HTMLButtonElement>();

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

		const onSentTemplateMessage = function (
			msg: any,
			data: CreateMessageRequest
		) {
			// Make data mutable
			data = { ...data };
			// Remove injected fields
			delete data.wa_id;
			delete data.pending_message_unique_id;

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

	const sendByRef = () => {
		setSending(true);
		sendButtonRef.current?.click();

		selectTemplateCallback?.();
	};

	const sendAction = (template: Template) => {
		const messageToBeSent = template ?? chosenTemplate;
		setSentTemplateMessage(messageToBeSent);
		onSend(messageToBeSent);
		sendCallback?.();
	};

	if (!chosenTemplate) {
		return <></>;
	}

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>{t('Send a template message')}</DialogTitle>
			<DialogContent ref={dialogContentRef}>
				<SendTemplateMessage
					data={chosenTemplate}
					send={(template: Template) => sendAction(template)}
					setSending={setSending}
					setErrors={setErrors}
					// @ts-ignore
					sendButtonInnerRef={sendButtonRef}
					// @ts-ignore
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
				<Button
					onClick={sendByRef}
					color="primary"
					disabled={isSending}
					autoFocus
					data-test-id="send-template-message-button"
				>
					{t('Send')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SendTemplateDialog;
