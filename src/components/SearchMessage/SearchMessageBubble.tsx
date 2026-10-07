import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { DoneAll, Check as Done } from '@src/components/icons';
import { cn } from '@src/lib/utils';
import {
	messageBubbleClassName,
	statusIconClassName,
} from '@src/components/Main/Chat/ChatMessage/messageBubble';
import ChatMessageTypeIcon from '@src/components/Main/Chat/ChatMessage/ChatMessageTypeIcon';
import PrintMessage from '@src/components/PrintMessage';
import {
	getEchoOriginLabel,
	getMessageCaption,
	getMessageTimestamp,
	getSenderName,
	isDeliveredOrRead,
	isRead,
} from '@src/helpers/MessageHelper';
import { Message, MessageType } from '@src/types/messages';

interface Props {
	message: Message;
	keyword: string;
	onClick: (message: Message) => void;
	contactProvidersData?: { [key: string]: any };
}

/**
 * A message search result, drawn like the message itself in the chat: on
 * the right in green when sent by the team, on the left when received,
 * with the matched words highlighted and the sender above, as in the chat.
 * Opens the message in the chat.
 */
const SearchMessageBubble: React.FC<Props> = ({
	message,
	keyword,
	onClick,
	contactProvidersData,
}) => {
	const { t } = useTranslation();

	const type = message.waba_payload?.type ?? MessageType.none;
	const text = message.waba_payload?.text?.body ?? getMessageCaption(message);
	const echoOriginLabel = getEchoOriginLabel(message);

	return (
		<div>
			{/* The sender, above the bubble, exactly as in the chat */}
			<div
				className={cn(
					'mx-2.5 mt-0 mb-0.5 block text-[length:x-small] font-semibold text-ink/75 [&_.emoji-mart-emoji]:size-3! [&_.emoji-mart-emoji]:align-middle',
					message.from_us && 'text-right'
				)}
			>
				{message.from_us
					? echoOriginLabel
						? t(echoOriginLabel)
						: getSenderName(message)
					: contactProvidersData?.[message.waba_payload?.wa_id ?? '']?.[0]
							?.name ?? getSenderName(message)}
			</div>

			<div
				role="button"
				tabIndex={0}
				className={cn(
					messageBubbleClassName({
						type,
						isOutgoing: message.from_us,
						isFirstInGroup: true,
					}),
					// Tighter than in the chat, and a hint that it opens
					'mb-2 max-w-[85%] cursor-pointer outline-none! transition-[filter,box-shadow] hover:brightness-[0.97] focus-visible:ring-2 focus-visible:ring-primary/60',
					!message.from_us && 'mr-auto'
				)}
				onClick={() => onClick(message)}
				onKeyDown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						onClick(message);
					}
				}}
			>
				<span className="[&_.app-icon]:mr-1 [&_.app-icon]:size-[0.9em]! [&_.app-icon]:align-[-0.1em] [&_.app-icon]:text-ink/45!">
					<ChatMessageTypeIcon type={type} />
				</span>
				{text ? (
					<PrintMessage
						className="[word-break:break-word]"
						message={text}
						highlightText={keyword}
					/>
				) : null}

				{/* The time (and ticks for sent messages), as in the chat */}
				<span className="float-right mt-1 ml-2.5 flex items-center text-[length:x-small] text-ink/60">
					<Moment date={getMessageTimestamp(message)} format="H:mm" unix />
					{message.from_us &&
						(isDeliveredOrRead(message) ? (
							<DoneAll
								className={cn(
									statusIconClassName(false),
									'size-3.5! fill-[#8990b4]!',
									isRead(message) && 'fill-light-blue!'
								)}
							/>
						) : (
							<Done className={cn(statusIconClassName(false), 'size-3.5!')} />
						))}
				</span>
			</div>
		</div>
	);
};

export default SearchMessageBubble;
