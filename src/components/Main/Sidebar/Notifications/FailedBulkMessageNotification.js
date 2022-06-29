import React from 'react';
import Moment from 'react-moment';
import { CALENDAR_SHORT } from '../../../../Constants';
import { useHistory } from 'react-router-dom';
import { Link } from '@material-ui/core';
import { generateMessagePreview } from '../../../../helpers/MessageHelper';
import { Trans, useTranslation } from 'react-i18next';

function FailedBulkMessageNotification(props) {
	const { t, i18n } = useTranslation();

	const history = useHistory();

	const handleClick = () => {
		history.push(`/main/chat/${props.data.waId}`);
	};

	const extractReasonFromResponsePayload = (responsePayload) => {
		const preparedResponsePayload = responsePayload
			.replace("b'", '')
			.replace("}'", '}');
		try {
			return JSON.parse(preparedResponsePayload).reason;
		} catch (e) {
			return responsePayload;
		}
	};

	return (
		<div className="notification error">
			<h3>
				{t(
					"Bulk message (ID: %s) couldn't be sent to a recipient.",
					props.data.id
				)}
			</h3>
			<div className="mb-1">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: [props.data.waId],
					}}
				>
					Recipient:{' '}
					<Link href="#" onClick={handleClick} className="bold">
						%s
					</Link>
				</Trans>
			</div>
			<div className="mb-1">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: [generateMessagePreview(props.data.task.payload)],
					}}
				>
					Message: <span className="bold">%s</span>
				</Trans>
			</div>
			<div className="mb-2">
				Status code: <span className="bold">{props.data.statusCode}</span>
			</div>
			<div className="mb-2">
				<code className="notification__code">
					{extractReasonFromResponsePayload(props.data.response)}
				</code>
			</div>
			<div className="notification__timestamp">
				<Moment date={props.data.timestamp} unix calendar={CALENDAR_SHORT} />
			</div>
		</div>
	);
}

export default FailedBulkMessageNotification;
