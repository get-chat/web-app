import React from 'react';
import { ATTACHMENT_TYPE_IMAGE } from '@src/Constants';
import '../../../../styles/ContextChatMessage.css';
import ChatMessageShortContent from './ChatMessageShortContent';
import ChatMessageModel from '@src/api/models/ChatMessageModel';

interface Props {
	contextMessage: ChatMessageModel;
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
				goToMessageId?.(contextMessage.id, contextMessage.timestamp)
			}
		>
			<div className="chat__message__context__info">
				<span className="chat__message__context__info__sender">
					{contextMessage.senderName}
				</span>

				<span className="chat__message__context__info__message">
					<ChatMessageShortContent
						type={contextMessage.type ?? ''}
						template={contextMessage.template}
						buttonText={contextMessage.buttonText}
						interactiveButtonText={contextMessage.interactiveButtonText}
						text={contextMessage.text}
						caption={contextMessage.caption}
						isLastMessageFromUs={contextMessage.isFromUs}
					/>
				</span>
			</div>

			{contextMessage.type === ATTACHMENT_TYPE_IMAGE && (
				<div className="chat__message__context__preview">
					<img
						src={contextMessage.generateImageLink()}
						alt={contextMessage.caption ?? undefined}
					/>
				</div>
			)}
		</div>
	);
};

export default ContextChatMessage;
