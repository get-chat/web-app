import React from 'react';
import styles from './ChatAssignmentEventView.module.css';
import Moment from 'react-moment';
import { Trans, useTranslation } from 'react-i18next';

import { ChatAssignmentEvent } from '@src/types/chatAssignment';

interface Props {
	data: ChatAssignmentEvent;
}

const ChatAssignmentEventView: React.FC<Props> = ({ data }) => {
	const { t } = useTranslation();

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
										sprintf: [data.done_by?.username ?? 'a user'],
									}}
								>
									<span className="bold">%s</span> has changed chat assignments.
								</Trans>
							</div>
						) : (
							<div>{t('Chat assignments were changed.')}</div>
						)}
					</div>

					{data.assigned_to_user_set && (
						<div>
							<Trans
								values={{
									postProcess: 'sprintf',
									sprintf: [data.assigned_to_user_set.username],
								}}
							>
								assigned to user: <span className="bold">%s</span>
							</Trans>
						</div>
					)}

					{data.assigned_group_set && (
						<div>
							<Trans
								values={{
									postProcess: 'sprintf',
									sprintf: [data.assigned_group_set.name],
								}}
							>
								assigned to group: <span className="bold">%s</span>
							</Trans>
						</div>
					)}

					{data.assigned_to_user_was_cleared && (
						<div>{t('cleared assigned user')}</div>
					)}

					{data.assigned_group_was_cleared && (
						<div>{t('cleared assigned group')}</div>
					)}
				</div>

				<div className={styles.timestamp}>
					<Moment date={data.timestamp} format={dateFormat} unix />
				</div>
			</div>
		</div>
	);
};

export default ChatAssignmentEventView;
