import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import SendTemplateMessage from './SendTemplateMessage';
import {
	EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
	EVENT_TOPIC_SENT_TEMPLATE_MESSAGE,
} from '../../../../Constants';
import PubSub from 'pubsub-js';
import ChatMessageClass from '../../../../ChatMessageClass';
import { generateTemplateMessagePayload } from '../../../../helpers/ChatHelper';
import TemplatesList from '../../../TemplatesList';
import { useSelector } from 'react-redux';

function TemplateMessages(props) {
	const templates = useSelector((state) => state.templates.value);

	const [chosenTemplate, setChosenTemplate] = useState();
	const [isDialogVisible, setDialogVisible] = useState(false);

	const [sentTemplateMessage, setSentTemplateMessage] = useState();

	const dialogContent = useRef();

	const [isSending, setSending] = useState(false);
	const [errors, setErrors] = useState();

	const sendButtonRef = useRef();
	const bulkSendButtonRef = useRef();

	useEffect(() => {
		setDialogVisible(false);
	}, [props.waId]);

	const showDialog = () => {
		setErrors(undefined);
		setDialogVisible(true);
	};

	const hideDialog = () => {
		setErrors(undefined);
		setDialogVisible(false);
	};

	const chooseTemplate = (template) => {
		setChosenTemplate(template);
		showDialog();
	};

	const send = (template) => {
		const messageToBeSent = template ?? chosenTemplate;
		setSentTemplateMessage(messageToBeSent);
		props.onSend(messageToBeSent);
		props.sendCallback?.();
		//hideDialog();
	};

	const bulkSend = (template) => {
		const payload = generateTemplateMessagePayload(template ?? chosenTemplate);
		props.onBulkSend(ChatMessageClass.TYPE_TEMPLATE, payload);
		props.sendCallback?.();
		hideDialog();
	};

	const sendByRef = () => {
		setSending(true);
		sendButtonRef.current?.click();

		props.selectTemplateCallback?.();
	};

	const bulkSendByRef = () => {
		bulkSendButtonRef.current?.click();
	};

	useEffect(() => {
		const onSendTemplateMessageError = function (msg, data) {
			setErrors(data);
			setSending(false);

			// Scroll to bottom
			if (dialogContent.current) {
				dialogContent.current.scrollTop = dialogContent.current.scrollHeight;
			}
		};

		const sendTemplateMessageErrorEventToken = PubSub.subscribe(
			EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
			onSendTemplateMessageError
		);

		const onSentTemplateMessage = function (msg, data) {
			// Remove injected fields
			delete data.wa_id;
			delete data.pendingMessageUniqueId;

			// Check if sent message is equal to current pending one
			if (
				sentTemplateMessage !== undefined &&
				JSON.stringify(data) ===
					JSON.stringify(generateTemplateMessagePayload(sentTemplateMessage))
			) {
				hideDialog();
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
	}, [dialogContent.current, sentTemplateMessage]);

	return (
		<div className="templateMessagesOuter">
			{/*<SearchBar />*/}

			{props.isLoadingTemplates ? (
				<Alert severity="info">Loading template messages...</Alert>
			) : (
				<TemplatesList
					templates={templates}
					onClick={(templateData) => chooseTemplate(templateData)}
					displayRegisterTemplate={true}
					isTemplatesFailed={props.isTemplatesFailed}
				/>
			)}

			<Dialog open={isDialogVisible} onClose={hideDialog}>
				<DialogTitle>{'Send a template message'}</DialogTitle>
				<DialogContent ref={dialogContent}>
					<SendTemplateMessage
						data={chosenTemplate}
						send={(template) => send(template)}
						setSending={setSending}
						bulkSend={(template) => bulkSend(template)}
						sendButtonInnerRef={sendButtonRef}
						bulkSendButtonInnerRef={bulkSendButtonRef}
					/>

					{errors && (
						<div className="templateMessagesDialogErrors">
							{errors.map((err, index) => (
								<Alert key={index} severity="error">
									<AlertTitle>{err.title}</AlertTitle>
									{err.details}
								</Alert>
							))}
						</div>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={hideDialog} color="secondary">
						Close
					</Button>
					<Button
						onClick={sendByRef}
						color="primary"
						disabled={isSending}
						autoFocus
						data-test-id="send-template-message-button"
					>
						Send
					</Button>
					<Button
						onClick={bulkSendByRef}
						color="primary"
						disabled={isSending}
						autoFocus
					>
						Bulk send
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default TemplateMessages;
