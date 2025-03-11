import React from 'react';
import Moment from 'react-moment';
import { CALENDAR_SHORT_DAYS } from '@src/Constants';

interface Props {
	text?: string;
	timestamp?: number;
}

const MessageDateIndicator: React.FC<Props> = ({ text, timestamp }) => {
	return (
		<div className="chat__message__dateContainer">
			<span className="chat__message__dateContainer__indicator">
				{/* TODO: <time {...} /> */}
				{text !== undefined ? (
					<span dangerouslySetInnerHTML={{ __html: text }} />
				) : (
					<Moment calendar={CALENDAR_SHORT_DAYS} date={timestamp} unix />
				)}
			</span>
		</div>
	);
};

export default MessageDateIndicator;
