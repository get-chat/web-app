// @ts-nocheck
import React from 'react';
import styles from './ChatAssignmentEvent.module.css';
import Moment from 'react-moment';
import { Trans, useTranslation } from 'react-i18next';

function ChatAssignmentEvent(props) {
	const { t } = useTranslation();

	const dateFormat = 'H:mm';

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.wrapper}>
					<div className={styles.title}>
						{props.data.done_by ? (
							<div>
								<Trans
									values={{
										postProcess: 'sprintf',
										sprintf: [props.data.done_by?.username ?? 'a user'],
									}}
								>
									<span className="bold">%s</span> has changed chat assignments.
								</Trans>
							</div>
						) : (
							<div>{t('Chat assignments were changed.')}</div>
						)}
					</div>

					{props.data.assigned_to_user_set && (
						<div>
							<Trans
								values={{
									postProcess: 'sprintf',
									sprintf: [props.data.assigned_to_user_set.username],
								}}
							>
								assigned to user: <span className="bold">%s</span>
							</Trans>
						</div>
					)}

					{props.data.assigned_group_set && (
						<div>
							<Trans
								values={{
									postProcess: 'sprintf',
									sprintf: [props.data.assigned_group_set.name],
								}}
							>
								assigned to group: <span className="bold">%s</span>
							</Trans>
						</div>
					)}

					{props.data.assigned_to_user_was_cleared && (
						<div>{t('cleared assigned user')}</div>
					)}

					{props.data.assigned_group_was_cleared && (
						<div>{t('cleared assigned group')}</div>
					)}
				</div>

				<div className={styles.timestamp}>
					<Moment date={props.data.timestamp} format={dateFormat} unix />
				</div>
			</div>
		</div>
	);
}

export default ChatAssignmentEvent;
