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
				<Styled.Title>{t('Connection error')}</Styled.Title>
				<Styled.Details>
					{!navigator.onLine ? (
						<>{t('You are not connected to the internet.')}</>
					) : (
						<>
							{t(
								'Connection lost. You may not receive new messages in real time.'
							)}
						</>
					)}
				</Styled.Details>
			</div>
		</Styled.Container>
	);
};

export default WebSocketConnectionIndicator;
