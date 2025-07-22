import React, { useState } from 'react';
import * as Styled from './WebSocketConnectionIndicator.styles';
import { useTranslation } from 'react-i18next';
import ReportIcon from '@mui/icons-material/Report';
import { useAppSelector } from '@src/store/hooks';

interface Props {}

const WebSocketConnectionIndicator: React.FC<Props> = () => {
	const { t } = useTranslation();
	const { isWebSocketDisconnected, webSocketDisconnectionCode } =
		useAppSelector((state) => state.UI);

	const [isExtraDetailsOpen, setExtraDetailsOpen] = useState(false);

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

					{navigator.onLine &&
						isWebSocketDisconnected &&
						webSocketDisconnectionCode && (
							<div>
								<Styled.ExtraDetailsTitle
									onClick={() => setExtraDetailsOpen(!isExtraDetailsOpen)}
								>
									{isExtraDetailsOpen ? t('Hide details') : t('Show details')}
								</Styled.ExtraDetailsTitle>
								<Styled.ExtraDetails in={isExtraDetailsOpen}>
									{t('Code: %d', webSocketDisconnectionCode ?? 0)}
								</Styled.ExtraDetails>
							</div>
						)}

					<Styled.RefreshContainer>
						<Styled.RefreshText>
							{t(
								'If the issue persists, you can try refreshing the page manually.'
							)}
						</Styled.RefreshText>
						<Styled.RefreshButton
							color="primary"
							variant="contained"
							size="small"
							onClick={() => {
								window.location.reload();
							}}
						>
							{t('Refresh')}
						</Styled.RefreshButton>
					</Styled.RefreshContainer>
				</Styled.Details>
			</div>
		</Styled.Container>
	);
};

export default WebSocketConnectionIndicator;
