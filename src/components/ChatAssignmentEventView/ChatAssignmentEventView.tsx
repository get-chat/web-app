import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ChatAssignmentEvent } from '@src/types/chatAssignment';
import ChatEvent from '@src/components/ChatEvent';

interface Props {
	data: ChatAssignmentEvent;
}

const ChatAssignmentEventView: React.FC<Props> = ({ data }) => {
	const { t } = useTranslation();

	return (
		<ChatEvent timestamp={data.timestamp}>
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
		</ChatEvent>
	);
};

export default ChatAssignmentEventView;
