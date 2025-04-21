import React from 'react';
import { LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as Styled from './UploadMediaIndicator.styles';

interface Props {
	isMobile: boolean;
}

const UploadMediaIndicator: React.FC<Props> = ({ isMobile = false }) => {
	const { t } = useTranslation();

	return (
		<Styled.Wrapper $isMobile={isMobile}>
			<Styled.StyledAlert severity="info" elevation={0}>
				<div>{t('Uploading a media file. Please wait...')}</div>
				<LinearProgress variant="indeterminate" />
			</Styled.StyledAlert>
		</Styled.Wrapper>
	);
};

export default UploadMediaIndicator;
