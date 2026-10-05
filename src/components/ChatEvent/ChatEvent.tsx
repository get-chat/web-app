import React from 'react';
import Moment from 'react-moment';

interface Props {
	/** Unix timestamp of the event, shown below the bubble */
	timestamp: number;
	children: React.ReactNode;
}

/** A system event in the chat (assignment, tagging...): a centred bubble with its time */
const ChatEvent: React.FC<Props> = ({ timestamp, children }) => (
	<div className="mb-6.25 flex justify-center">
		<div className="flex flex-col items-center text-[12px]">
			<div className="flex flex-col items-center rounded-[15px] bg-white/80 px-2.5 py-1.25 text-ink/70 shadow-[0_4px_5px_-6px_rgb(185,152,136)]">
				{children}
			</div>
			<div className="mt-1.25 text-[10px] text-ink/60">
				<Moment date={timestamp} format="H:mm" unix />
			</div>
		</div>
	</div>
);

export default ChatEvent;
