// @ts-nocheck
import React from 'react';
import ChatMessageTypeIcon from './ChatMessageTypeIcon';
import ChatMessageTypeLabel from './ChatMessageTypeLabel';
import ReplyIcon from '@mui/icons-material/Reply';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import PrintMessage from '../../../PrintMessage';
import { insertTemplateComponentParameters } from '@src/helpers/TemplateMessageHelper';
import { useAppSelector } from '@src/store/hooks';
import { useTranslation } from 'react-i18next';

function ChatMessageShortContent(props) {
	const templates = useAppSelector((state) => state.templates.value);
	const { t } = useTranslation();

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
		} else if (props.type === ChatMessageModel.TYPE_REACTION) {
			let rawText = '';
			if (props.isLastMessageFromUs) {
				rawText = t('You reacted with: %s', props.reaction?.emoji);
			} else {
				rawText = t('Reacted with: %s', props.reaction?.emoji);
			}

			const text = t(rawText);
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
