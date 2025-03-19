import React from 'react';
import ChatMessageTypeIcon from './ChatMessageTypeIcon';
import ChatMessageTypeLabel from './ChatMessageTypeLabel';
import ReplyIcon from '@mui/icons-material/Reply';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import PrintMessage from '../../../PrintMessage';
import { insertTemplateComponentParameters } from '@src/helpers/TemplateMessageHelper';
import { useAppSelector } from '@src/store/hooks';
import { useTranslation } from 'react-i18next';
import { Template } from '@src/types/templates';
import { Reaction } from '@src/types/messages';

interface Props {
	type: string;
	text?: string | undefined | null;
	caption?: string | undefined | null;
	buttonText?: string | undefined | null;
	interactiveButtonText?: string | undefined | null;
	isLastMessageFromUs: boolean;
	template?: Template | undefined;
	reaction?: Reaction | undefined;
}

const ChatMessageShortContent: React.FC<Props> = ({
	type,
	text,
	caption,
	buttonText,
	interactiveButtonText,
	isLastMessageFromUs,
	template,
	reaction,
}) => {
	const templates = useAppSelector((state) => state.templates.value);
	const { t } = useTranslation();

	const print = () => {
		if (type === ChatMessageModel.TYPE_TEMPLATE && template) {
			const templateData = templates[template.name];
			if (templateData) {
				const component = templateData.components?.filter(
					(comp) => comp.type === 'BODY'
				)?.[0];
				if (component) {
					return insertTemplateComponentParameters(
						component,
						template.components ?? []
					);
				}
			}
		} else if (
			[ChatMessageModel.TYPE_TEXT, ChatMessageModel.TYPE_BUTTON].includes(type)
		) {
			const finalText = text ?? buttonText ?? interactiveButtonText ?? '';
			return <PrintMessage message={finalText} smallEmoji={true} />;
		} else if (type === ChatMessageModel.TYPE_REACTION) {
			let rawText = '';
			if (isLastMessageFromUs) {
				rawText = reaction?.emoji
					? t('You reacted with: %s', reaction.emoji)
					: t('You deleted a reaction.');
			} else {
				rawText = reaction?.emoji
					? t('Reacted with: %s', reaction.emoji)
					: t('Deleted a reaction.');
			}

			const text = t(rawText);
			return <PrintMessage message={text} smallEmoji={true} />;
		}

		return (
			<span>
				{caption && caption.length > 0 ? (
					<PrintMessage message={caption} smallEmoji={true} />
				) : (
					<ChatMessageTypeLabel type={type} />
				)}
			</span>
		);
	};

	return (
		<div>
			{isLastMessageFromUs && <ReplyIcon className="replyIcon" />}
			<ChatMessageTypeIcon type={type} />
			{print()}
		</div>
	);
};

export default ChatMessageShortContent;
