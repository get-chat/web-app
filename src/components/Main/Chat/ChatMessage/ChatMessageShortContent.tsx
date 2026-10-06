import React from 'react';
import ChatMessageTypeIcon from './ChatMessageTypeIcon';
import ChatMessageTypeLabel from './ChatMessageTypeLabel';
import ReplyIcon from '@src/components/icons/Reply';
import PrintMessage from '../../../PrintMessage';
import {
	findTemplate,
	insertTemplateComponentParameters,
} from '@src/helpers/TemplateMessageHelper';
import { useAppSelector } from '@src/store/hooks';
import { useTranslation } from 'react-i18next';
import { Template } from '@src/types/templates';
import { MessageType, Reaction } from '@src/types/messages';

interface Props {
	type: MessageType;
	text?: string | undefined | null;
	caption?: string | undefined | null;
	buttonText?: string | undefined | null;
	interactiveButtonText?: string | undefined | null;
	isLastMessageFromUs: boolean;
	template?: Template | undefined;
	reaction?: Reaction | undefined;
	className?: string;
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
	className,
}) => {
	const templates = useAppSelector((state) => state.templates.value);
	const { t } = useTranslation();

	const print = () => {
		if (type === MessageType.template && template) {
			const templateData = findTemplate(
				templates,
				template.name,
				template.language
			);
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
		} else if ([MessageType.text, MessageType.button].includes(type)) {
			const finalText = text ?? buttonText ?? interactiveButtonText ?? '';
			return <PrintMessage message={finalText} smallEmoji={true} />;
		} else if (type === MessageType.reaction) {
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
		<div className={className}>
			{isLastMessageFromUs && (
				// replyIcon: the list and the reply quote size the other icons
				// here, but not this one
				<ReplyIcon className="replyIcon -mt-0.75 size-[0.6em]! align-middle" />
			)}
			<ChatMessageTypeIcon type={type} />
			{print()}
		</div>
	);
};

export default ChatMessageShortContent;
