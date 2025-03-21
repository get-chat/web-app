import React from 'react';
import { ATTACHMENT_TYPE_IMAGE } from '@src/Constants';
import '../../../../styles/ContextChatMessage.css';
import ChatMessageShortContent from './ChatMessageShortContent';
import { Message } from '@src/types/messages';
import {
	generateImageLink,
	getMessageCaption,
	getMessageTimestamp,
	getSenderName,
} from '@src/helpers/MessageHelper';

interface Props {
	contextMessage: Message;
	goToMessageId?: (id: string, timestamp: number) => void;
}

const ContextChatMessage: React.FC<Props> = ({
	contextMessage,
	goToMessageId,
}) => {
	return (
		<div
			className="chat__message__context"
			onClick={() =>
				goToMessageId?.(contextMessage.id, getMessageTimestamp(contextMessage))
			}
		>
			<div className="chat__message__context__info">
				<span className="chat__message__context__info__sender">
					{getSenderName(contextMessage)}
				</span>

				<span className="chat__message__context__info__message">
					<ChatMessageShortContent
						type={contextMessage.waba_payload?.type ?? ''}
						template={contextMessage.waba_payload?.template}
						buttonText={contextMessage.waba_payload?.button?.text}
						interactiveButtonText={
							contextMessage.waba_payload?.interactive?.button_reply?.title
						}
						text={contextMessage.waba_payload?.text?.body}
						caption={getMessageCaption(contextMessage)}
						isLastMessageFromUs={contextMessage.from_us}
					/>
				</span>
			</div>

			{contextMessage.waba_payload?.type === ATTACHMENT_TYPE_IMAGE && (
				<div className="chat__message__context__preview">
					<img
						src={generateImageLink(contextMessage)}
						alt={getMessageCaption(contextMessage)}
					/>
				</div>
			)}
		</div>
	);
};

export default ContextChatMessage;
