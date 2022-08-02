import React from 'react';
import '../styles/SearchMessageResult.css';
import Moment from 'react-moment';
import ChatMessageClass from '../ChatMessageClass';
import DoneAll from '@material-ui/icons/DoneAll';
import DoneIcon from '@material-ui/icons/Done';
import { CALENDAR_NORMAL } from '../Constants';
import ChatMessageTypeIcon from './Main/Chat/ChatMessage/ChatMessageTypeIcon';
import { ListItem } from '@material-ui/core';
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
							data.type === ChatMessageClass.TYPE_TEXT && (
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
