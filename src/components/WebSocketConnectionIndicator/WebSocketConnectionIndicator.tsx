import React from 'react';
import { useTranslation } from 'react-i18next';
import ReportIcon from '@src/components/icons/Report';
import { useAppSelector } from '@src/store/hooks';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';

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
		<div className="flex items-start gap-3.75 bg-destructive p-3.75 text-white">
			<ReportIcon className="size-12! text-white!" />
			<div>
				<div className="text-[16px] font-semibold">
					{t('Connection error')}{' '}
					{!isBrowserOffline &&
						isWebSocketDisconnected &&
						webSocketDisconnectionCode && (
							<span className="font-normal opacity-75">
								{t('(Code: %d)', webSocketDisconnectionCode ?? 0)}
							</span>
						)}
				</div>
				<div className="text-[14px]">
					{isBrowserOffline ? (
						<>
							{t(
								'No Internet connection. The inbox will refresh after the Internet is back.'
							)}
						</>
					) : (
						<>
							{t(
								'Connection lost. You may not receive new messages in real time.'
							)}
						</>
					)}

					{isWebSocketDisconnected && !isBrowserOffline && (
						<div className="mt-3.75 flex items-start gap-3.75">
							<div
								className={cn(
									'mb-[8px] px-2 py-1 text-[12px] font-semibold',
									// After a while, the advice turns into a stronger one
									showCacheSuggestion &&
										'rounded-[10px] bg-destructive-dark transition-all duration-500 ease-[ease]'
								)}
							>
								{showCacheSuggestion
									? t(
											'Please try refreshing the page. If the problem persists, clearing your browser cache may help.'
									  )
									: t(
											'If the issue persists, you can try refreshing the page manually.'
									  )}
							</div>
							<Button
								variant="unstyled"
								size="sm"
								className="h-auto bg-white px-2.5 py-0.5 text-destructive hover:bg-white/85"
								onClick={() => {
									window.location.reload();
								}}
							>
								{t('Refresh')}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default WebSocketConnectionIndicator;
