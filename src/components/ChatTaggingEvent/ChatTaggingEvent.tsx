import React from 'react';
import Moment from 'react-moment';
import { Trans } from 'react-i18next';
import SellIcon from '@mui/icons-material/Sell';
import { ChatTagging } from '@src/types/messages';
import {
	Container,
	Content,
	Wrapper,
	Title,
	Timestamp,
} from './ChatTaggingEvent.styles';

interface Props {
	data: ChatTagging;
}

const ChatTaggingEvent: React.FC<Props> = ({ data }) => {
	const dateFormat = 'H:mm';

	return (
		<Container>
			<Content>
				<Wrapper>
					<Title>
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
									<span className="bold">%(username)s</span> has {data.action}{' '}
									tag:{' '}
									<SellIcon
										style={{
											fill: data.tag?.web_inbox_color,
										}}
									/>
									<span className="bold">%(tag)s</span>.
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
										style={{
											fill: data.tag?.web_inbox_color,
										}}
									/>
									<span className="bold">%(tag)s</span>.
								</Trans>
							</div>
						)}
					</Title>
				</Wrapper>

				<Timestamp>
					<Moment date={data.timestamp} format={dateFormat} unix />
				</Timestamp>
			</Content>
		</Container>
	);
};

export default ChatTaggingEvent;
