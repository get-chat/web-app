import React from 'react';
import { Trans } from 'react-i18next';
import SellIcon from '@src/components/icons/Sell';
import ChatEvent from '@src/components/ChatEvent';
import { ChatTagging } from '@src/types/messages';

// The tag icon sits in the sentence; `!` beats the icon's unlayered 24px size
const tagIconClass = 'mr-0.75! size-4!';

interface Props {
	data: ChatTagging;
}

const ChatTaggingEvent: React.FC<Props> = ({ data }) => {
	return (
		<ChatEvent timestamp={data.timestamp}>
			{data.done_by ? (
				<div>
					<Trans
						values={{
							postProcess: 'sprintf',
							sprintf: {
								username: data.done_by.username,
								tag: data.tag?.name,
							},
						}}
					>
						<span className="font-semibold">%(username)s</span> has{' '}
						{data.action} tag:{' '}
						<SellIcon
							className={tagIconClass}
							style={{
								fill: data.tag?.web_inbox_color,
							}}
						/>
						<span className="font-semibold">%(tag)s</span>.
					</Trans>
				</div>
			) : (
				<div>
					<Trans
						values={{
							postProcess: 'sprintf',
							sprintf: { tag: data.tag?.name },
						}}
					>
						A tag was {data.action}:{' '}
						<SellIcon
							className={tagIconClass}
							style={{
								fill: data.tag?.web_inbox_color,
							}}
						/>
						<span className="font-semibold">%(tag)s</span>.
					</Trans>
				</div>
			)}
		</ChatEvent>
	);
};

export default ChatTaggingEvent;
