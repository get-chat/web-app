import React from 'react';
import Moment from 'react-moment';
import { CALENDAR_SHORT_DAYS } from '@src/Constants';
import { cn } from '@src/lib/utils';

interface Props {
	text?: string;
	timestamp?: number;
	/** The copy floating at the top of the chat while it scrolls */
	isFixed?: boolean;
	className?: string;
}

const MessageDateIndicator: React.FC<Props> = ({
	text,
	timestamp,
	isFixed = false,
	className,
}) => {
	return (
		// The class names are hooks for ChatView, which finds the dates by them
		<div
			className={cn(
				'chat__message__dateContainer mx-2.5 mt-5 mb-7.5 flex items-center justify-center',
				isFixed && 'mb-0',
				className
			)}
		>
			<span
				className={cn(
					'chat__message__dateContainer__indicator rounded-[15px] bg-white/65 px-2.5 py-1.5 text-[12px] font-semibold text-chat-icon shadow-[0_4px_5px_-6px_rgb(185,152,136)] backdrop-blur-[8px]',
					isFixed &&
						'pointer-events-auto bg-white shadow-[0_6px_10px_-6px_rgb(185,152,136)]'
				)}
			>
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
