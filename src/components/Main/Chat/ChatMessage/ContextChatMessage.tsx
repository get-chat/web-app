import React from 'react';
import { ATTACHMENT_TYPE_IMAGE } from '@src/Constants';
import ChatMessageShortContent from './ChatMessageShortContent';
import { Message, MessageType } from '@src/types/messages';
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
			// A quote of the message this one replies to
			className="-mx-1.5 -mt-px mb-[4px] flex cursor-pointer rounded-[4px] border-l-4 border-primary bg-ink/6 text-[12px] [&_.chatMessageTypeLabel]:font-semibold"
			onClick={() =>
				goToMessageId?.(
					contextMessage.id,
					getMessageTimestamp(contextMessage) ?? -1
				)
			}
		>
			<div className="flex flex-1 flex-col px-2.5 py-1.25">
				<span className="font-semibold text-primary">
					{getSenderName(contextMessage)}
				</span>

				{/* The reply arrow keeps the smaller size App.css gives .replyIcon */}
				<span className="line-clamp-3 text-ellipsis text-ink/60 [&_.app-icon]:mr-0.75 [&_.app-icon:not(.replyIcon)]:size-[0.8em]!">
					<ChatMessageShortContent
						type={contextMessage.waba_payload?.type ?? MessageType.none}
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
				<div className="ml-0.75">
					<img
						className="block h-full min-h-12 w-12 rounded-r-[4px] object-cover"
						src={generateImageLink(contextMessage)}
						alt={getMessageCaption(contextMessage)}
					/>
				</div>
			)}
		</div>
	);
};

export default ContextChatMessage;
