import React from 'react';
import * as Styled from './WebSocketConnectionIndicator.styles';
import { useTranslation } from 'react-i18next';
import ReportIcon from '@mui/icons-material/Report';

interface Props {}

const WebSocketConnectionIndicator: React.FC<Props> = () => {
	const { t } = useTranslation();

	return (
		<Styled.Container>
			<ReportIcon />
			<div>
				<Styled.Title>{t('You are not connected')}</Styled.Title>
				<Styled.Details>{t('Try refreshing the page!')}</Styled.Details>
			</div>
		</Styled.Container>
	);
};

export default WebSocketConnectionIndicator;
