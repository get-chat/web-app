import React from 'react';
import * as Styled from './SearchMessageResult.styles';
import Moment from 'react-moment';
import { CALENDAR_NORMAL } from '@src/Constants';
import ChatMessageTypeIcon from '../Main/Chat/ChatMessage/ChatMessageTypeIcon';
import { ListItem } from '@mui/material';
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
		<ListItem button onClick={() => onClick(data)}>
			<Styled.MessageContainer>
				<Styled.MessageHeader>
					<Moment
						unix
						calendar={CALENDAR_NORMAL}
						date={getMessageTimestamp(data)}
					/>

					{displaySender && <h3>{getSenderName(data)}</h3>}
				</Styled.MessageHeader>
				<Styled.MessageBody>
					<Styled.MessageTypeContainer>
						{data.from_us && data.waba_payload?.type === MessageType.text && (
							<Styled.ReceivedStatus
								className={isRead(data) ? 'chat__received' : ''}
							>
								{isDeliveredOrRead(data) ? (
									<Styled.StyledDoneAll className="chat__iconDoneAll" />
								) : (
									<Styled.StyledDone />
								)}
							</Styled.ReceivedStatus>
						)}

						<ChatMessageTypeIcon
							type={data.waba_payload?.type ?? MessageType.none}
						/>
					</Styled.MessageTypeContainer>
					<PrintMessage
						message={
							data.waba_payload?.text?.body ?? getMessageCaption(data) ?? ''
						}
						highlightText={keyword}
					/>
				</Styled.MessageBody>
			</Styled.MessageContainer>
		</ListItem>
	);
};

export default SearchMessageResult;
