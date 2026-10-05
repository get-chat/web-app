import React from 'react';
import { DoneAll, Check as Done } from '@src/components/icons';
import { cn } from '@src/lib/utils';
import Moment from 'react-moment';
import { CALENDAR_NORMAL } from '@src/Constants';
import ChatMessageTypeIcon from '../Main/Chat/ChatMessage/ChatMessageTypeIcon';
import PrintMessage from '../PrintMessage';
import {
	getMessageCaption,
	getMessageTimestamp,
	getSenderName,
	isDeliveredOrRead,
	isRead,
} from '@src/helpers/MessageHelper';
import { Message, MessageType } from '@src/types/messages';

interface Props {
	displaySender: boolean;
	messageData: Message;
	onClick: (chatMessage: Message) => void;
	keyword: string;
}

const SearchMessageResult: React.FC<Props> = ({
	displaySender,
	messageData,
	onClick,
	keyword,
}) => {
	const data = messageData;

	return (
		<div
			role="button"
			tabIndex={0}
			className="relative flex w-full cursor-pointer items-center justify-start text-left text-[14px] outline-none! transition-[background-color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] select-none [-webkit-tap-highlight-color:transparent] hover:bg-black/4 focus-visible:bg-black/12"
			onClick={() => onClick(data)}
			onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
				// Activate with the keyboard, as MUI's ListItem button did
				if (event.target !== event.currentTarget) return;
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onClick(data);
				}
			}}
		>
			<div className="px-3.75 py-2.5">
				<div className="text-[12px] text-ink/45">
					<Moment
						unix
						calendar={CALENDAR_NORMAL}
						date={getMessageTimestamp(data)}
					/>

					{displaySender && (
						<h3 className="mt-1.25 mb-0.5 px-3.75 py-2.5 text-[14px] font-normal text-primary">
							{getSenderName(data)}
						</h3>
					)}
				</div>
				<div className="text-[14px] break-all text-ink/60">
					<span className="[&_.app-icon]:mr-1.25 [&_.app-icon]:ml-0! [&_.app-icon]:size-[0.75em]!">
						{data.from_us && data.waba_payload?.type === MessageType.text && (
							<span>
								{isDeliveredOrRead(data) ? (
									<DoneAll
										className={cn(
											'chat__iconDoneAll',
											isRead(data) && '[&_*]:fill-light-blue'
										)}
									/>
								) : (
									<Done />
								)}
							</span>
						)}

						<ChatMessageTypeIcon
							type={data.waba_payload?.type ?? MessageType.none}
						/>
					</span>
					<PrintMessage
						message={
							data.waba_payload?.text?.body ?? getMessageCaption(data) ?? ''
						}
						highlightText={keyword}
					/>
				</div>
			</div>
		</div>
	);
};

export default SearchMessageResult;
