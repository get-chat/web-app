import React from 'react';
import styles from './ChatTaggingEvent.module.css';
import Moment from 'react-moment';
import { Trans } from 'react-i18next';
import SellIcon from '@mui/icons-material/Sell';

interface Props {
	data: {
		done_by: any;
		tag?: any;
		action: any;
		timestamp?: string;
	};
}

const ChatTaggingEvent: React.FC<Props> = ({ data }) => {
	const dateFormat = 'H:mm';

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.wrapper}>
					<div className={styles.title}>
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
											fill: data.tag?.color,
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
											fill: data.tag?.color,
										}}
									/>
									<span className="bold">%(tag)s</span>.
								</Trans>
							</div>
						)}
					</div>
				</div>

				<div className={styles.timestamp}>
					<Moment date={data.timestamp} format={dateFormat} unix />
				</div>
			</div>
		</div>
	);
};

export default ChatTaggingEvent;
