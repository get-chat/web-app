import React from 'react';
import * as Styled from './WebSocketConnectionIndicator.styles';
import { useTranslation } from 'react-i18next';
import ReportIcon from '@mui/icons-material/Report';
import { useAppSelector } from '@src/store/hooks';

interface Props {}

const WebSocketConnectionIndicator: React.FC<Props> = () => {
	const { t } = useTranslation();
	const {
		isBrowserOffline,
		isWebSocketDisconnected,
		webSocketDisconnectionCode,
	} = useAppSelector((state) => state.UI);

	const [showCacheSuggestion, setShowCacheSuggestion] = React.useState(false);
	const timerRef = React.useRef<NodeJS.Timeout | null>(null);

	React.useEffect(() => {
		// Reset whenever connection state or code changes
		setShowCacheSuggestion(false);
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		// If disconnected with code 1000, start a timer
		if (isWebSocketDisconnected && webSocketDisconnectionCode === 1000) {
			timerRef.current = setTimeout(() => {
				setShowCacheSuggestion(true);
			}, 20000);
		}

		// Clean up timer on unmount
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [isWebSocketDisconnected, webSocketDisconnectionCode]);

	return (
		<Styled.Container>
			<ReportIcon />
			<div>
				<Styled.Title>
					{t('Connection error')}{' '}
					{!isBrowserOffline &&
						isWebSocketDisconnected &&
						webSocketDisconnectionCode && (
							<Styled.TitleCode>
								{t('(Code: %d)', webSocketDisconnectionCode ?? 0)}
							</Styled.TitleCode>
						)}
				</Styled.Title>
				<Styled.Details>
					{isBrowserOffline ? (
						<>{t('You are not connected to the internet.')}</>
					) : (
						<>
							{t(
								'Connection lost. You may not receive new messages in real time.'
							)}
						</>
					)}

					{isWebSocketDisconnected && !isBrowserOffline && (
						<>
							<Styled.RefreshContainer>
								<Styled.RefreshText $highlight={showCacheSuggestion}>
									{showCacheSuggestion
										? t(
												'Please try refreshing the page. If the problem persists, clearing your browser cache may help.'
										  )
										: t(
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
						</>
					)}
				</Styled.Details>

				<div>{t('')}</div>
			</div>
		</Styled.Container>
	);
};

export default WebSocketConnectionIndicator;
