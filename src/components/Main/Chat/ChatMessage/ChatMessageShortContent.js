import React from 'react';
import ChatMessageTypeIcon from './ChatMessageTypeIcon';
import ChatMessageTypeLabel from './ChatMessageTypeLabel';
import ReplyIcon from '@mui/icons-material/Reply';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import PrintMessage from '../../../PrintMessage';
import { useSelector } from 'react-redux';
import { insertTemplateComponentParameters } from '@src/helpers/TemplateMessageHelper';

function ChatMessageShortContent(props) {
	const templates = useSelector((state) => state.templates.value);

	const print = () => {
		if (props.type === ChatMessageModel.TYPE_TEMPLATE && props.template) {
			const templateData = templates[props.template.name];
			if (templateData) {
				const component = templateData.components?.filter(
					(comp) => comp.type === 'BODY'
				)?.[0];
				if (component) {
					return insertTemplateComponentParameters(
						component,
						props.template.components
					);
				}
			}
		} else if (
			[ChatMessageModel.TYPE_TEXT, ChatMessageModel.TYPE_BUTTON].includes(
				props.type
			)
		) {
			const text =
				props.text ?? props.buttonText ?? props.interactiveButtonText;
			return <PrintMessage message={text} smallEmoji={true} />;
		}

		return (
			<span>
				{props.caption && props.caption.length > 0 ? (
					<PrintMessage message={props.caption} smallEmoji={true} />
				) : (
					<ChatMessageTypeLabel type={props.type} />
				)}
			</span>
		);
	};

	return (
		<div>
			{props.isLastMessageFromUs && <ReplyIcon className="replyIcon" />}
			<ChatMessageTypeIcon type={props.type} />
			{print()}
		</div>
	);
}

export default ChatMessageShortContent;
