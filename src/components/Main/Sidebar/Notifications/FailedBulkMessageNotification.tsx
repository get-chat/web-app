import React from 'react';
import Moment from 'react-moment';
import { CALENDAR_SHORT } from '@src/Constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import { generateMessagePreview } from '@src/helpers/MessageHelper';
import { Trans, useTranslation } from 'react-i18next';
import BulkMessageTaskElementModel from '@src/api/models/BulkMessageTaskElementModel';

interface Props {
	data: BulkMessageTaskElementModel;
}

const FailedBulkMessageNotification: React.FC<Props> = ({ data }) => {
	const { t } = useTranslation();

	const navigate = useNavigate();
	const location = useLocation();

	const handleClick = () => {
		navigate(`/main/chat/${data.waId}${location.search}`);
	};

	const extractReasonFromResponsePayload = (responsePayload: any) => {
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
				{t("Bulk message (ID: %s) couldn't be sent to a recipient.", data.id)}
			</h3>
			<div className="mb-1">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: [data.waId],
					}}
				>
					Recipient:{' '}
					<Link
						href="#"
						onClick={handleClick}
						className="bold"
						underline="hover"
					>
						%s
					</Link>
				</Trans>
			</div>
			<div className="mb-1">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: [generateMessagePreview(data.task?.payload)],
					}}
				>
					Message: <span className="bold">%s</span>
				</Trans>
			</div>
			<div className="mb-2">
				Status code: <span className="bold">{data.statusCode}</span>
			</div>
			<div className="mb-2 notification__codeWrapper">
				<code className="notification__code">
					{extractReasonFromResponsePayload(data.response)}
				</code>
			</div>
			<div className="notification__timestamp">
				<Moment date={data.timestamp} unix calendar={CALENDAR_SHORT} />
			</div>
		</div>
	);
};

export default FailedBulkMessageNotification;
