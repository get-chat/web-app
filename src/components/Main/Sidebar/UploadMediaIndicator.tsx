import React from 'react';
import { LinearProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import '../../../styles/UploadMediaIndicator.css';
import { useTranslation } from 'react-i18next';

function UploadMediaIndicator() {
	const { t } = useTranslation();

	return (
		<div className="uploadingMediaIndicatorWrapper">
			<Alert className="uploadingMediaIndicator" severity="info" elevation={0}>
				<div>{t('Uploading a media file. Please wait...')}</div>
				<LinearProgress variant="indeterminate" />
			</Alert>
		</div>
	);
}

export default UploadMediaIndicator;
