// @ts-nocheck
import React from 'react';
import '../styles/SearchMessageResult.css';
import Moment from 'react-moment';
import ChatMessageModel from '../api/models/ChatMessageModel';
import DoneAll from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import { CALENDAR_NORMAL } from '../Constants';
import ChatMessageTypeIcon from './Main/Chat/ChatMessage/ChatMessageTypeIcon';
import { ListItem } from '@mui/material';
import PrintMessage from './PrintMessage';

function SearchMessageResult(props) {
	const data = props.messageData;

	return (
		<ListItem button onClick={() => props.onClick(data)}>
			<div className="searchResult__message">
				<div className="searchResult__message__header">
					<Moment unix calendar={CALENDAR_NORMAL} date={data.timestamp} />

					{props.displaySender === true && <h3>{data.senderName}</h3>}
				</div>
				<div className="searchResult__message__body">
					<span className="searchResult__message__body__type">
						{data.isFromUs === true &&
							data.type === ChatMessageModel.TYPE_TEXT && (
								<span className={data.isRead() ? 'chat__received' : ''}>
									{data.isDeliveredOrRead() ? (
										<DoneAll className="chat__iconDoneAll" />
									) : (
										<DoneIcon />
									)}
								</span>
							)}

						<ChatMessageTypeIcon type={data.type} />
					</span>
					<PrintMessage
						message={data.text ?? data.caption}
						highlightText={props.keyword}
					/>
				</div>
			</div>
		</ListItem>
	);
}

export default SearchMessageResult;
