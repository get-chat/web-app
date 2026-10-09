import React, { useEffect, useRef, useState } from 'react';
import CloseIcon from '@src/components/icons/Close';
import PanelHeader from '@src/components/PanelHeader';
import { cn } from '@src/lib/utils';
import { useTranslation } from 'react-i18next';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { CancelTokenSource } from 'axios';
import {
	overlayPanelAnimation,
	PanelTransitionProps,
} from '@src/styles/panelTransitions';

interface Props extends PanelTransitionProps {
	onHide: () => void;
}

const Notifications: React.FC<Props> = ({
	onHide,
	isExiting,
	onAnimationEnd,
}) => {
	const { t } = useTranslation();

	const [isLoaded] = useState(true);
	let cancelTokenSourceRef = useRef<CancelTokenSource>();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				// Escape
				onHide();
			}
		};

		document.addEventListener('keydown', handleKey);

		cancelTokenSourceRef.current = generateCancelToken();

		return () => {
			document.removeEventListener('keydown', handleKey);
			cancelTokenSourceRef.current?.cancel();
		};
	}, []);

	return (
		<div
			className={cn(
				'absolute inset-0 z-10 flex flex-col bg-white',
				overlayPanelAnimation(isExiting)
			)}
			onAnimationEnd={onAnimationEnd}
		>
			<PanelHeader
				title={t('Notifications')}
				icon={<CloseIcon />}
				onClose={onHide}
			/>

			<div className="relative flex-1 overflow-x-hidden overflow-y-auto">
				{isLoaded && (
					<div className="px-3.75 py-2.5 text-[14px]">
						{t('You have no notifications')}
					</div>
				)}
			</div>
		</div>
	);
};

export default Notifications;
