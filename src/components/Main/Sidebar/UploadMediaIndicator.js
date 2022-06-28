import React from 'react';
import { LinearProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import '../../../styles/UploadMediaIndicator.css';
import { useTranslation } from 'react-i18next';

function UploadMediaIndicator() {
	const { t, i18n } = useTranslation();

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
