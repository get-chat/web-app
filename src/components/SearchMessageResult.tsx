import React from 'react';
import '../styles/SearchMessageResult.css';
import Moment from 'react-moment';
import DoneAll from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import { CALENDAR_NORMAL } from '../Constants';
import ChatMessageTypeIcon from './Main/Chat/ChatMessage/ChatMessageTypeIcon';
import { ListItem } from '@mui/material';
import PrintMessage from './PrintMessage';
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
		<ListItem button onClick={() => onClick(data)}>
			<div className="searchResult__message">
				<div className="searchResult__message__header">
					<Moment
						unix
						calendar={CALENDAR_NORMAL}
						date={getMessageTimestamp(data)}
					/>

					{displaySender && <h3>{getSenderName(data)}</h3>}
				</div>
				<div className="searchResult__message__body">
					<span className="searchResult__message__body__type">
						{data.from_us && data.waba_payload?.type === MessageType.text && (
							<span className={isRead(data) ? 'chat__received' : ''}>
								{isDeliveredOrRead(data) ? (
									<DoneAll className="chat__iconDoneAll" />
								) : (
									<DoneIcon />
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
		</ListItem>
	);
};

export default SearchMessageResult;
