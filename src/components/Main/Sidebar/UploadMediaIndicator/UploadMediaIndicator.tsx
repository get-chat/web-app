import React from 'react';
import { Progress } from '@src/components/ui/progress';
import { useTranslation } from 'react-i18next';
import * as Styled from './UploadMediaIndicator.styles';

interface Props {
	isMobile?: boolean;
}

const UploadMediaIndicator: React.FC<Props> = ({ isMobile = false }) => {
	const { t } = useTranslation();

	return (
		<Styled.Wrapper $isMobile={isMobile}>
			<Styled.StyledAlert severity="info">
				<div>{t('Uploading a media file. Please wait...')}</div>
				<Progress />
			</Styled.StyledAlert>
		</Styled.Wrapper>
	);
};

export default UploadMediaIndicator;
