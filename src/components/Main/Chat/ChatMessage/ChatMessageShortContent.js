import React from 'react';
import ChatMessageTypeIcon from './ChatMessageTypeIcon';
import ChatMessageTypeLabel from './ChatMessageTypeLabel';
import ReplyIcon from '@mui/icons-material/Reply';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import PrintMessage from '../../../PrintMessage';

function ChatMessageShortContent(props) {
	const text = props.text ?? props.buttonText ?? props.interactiveButtonText;

	return (
		<div>
			{props.isLastMessageFromUs && <ReplyIcon className="replyIcon" />}

			<ChatMessageTypeIcon type={props.type} />

			{[ChatMessageModel.TYPE_TEXT, ChatMessageModel.TYPE_BUTTON].includes(
				props.type
			) ? (
				<PrintMessage message={text} smallEmoji={true} />
			) : (
				<span>
					{props.caption && props.caption.length > 0 ? (
						<PrintMessage message={props.caption} smallEmoji={true} />
					) : (
						<ChatMessageTypeLabel type={props.type} />
					)}
				</span>
			)}
		</div>
	);
}

export default ChatMessageShortContent;
