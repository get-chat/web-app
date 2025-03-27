import React, { useEffect, useRef, useState } from 'react';
import '../../../../styles/Notifications.css';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { CancelTokenSource } from 'axios';

interface Props {
	onHide: () => void;
}

const Notifications: React.FC<Props> = ({ onHide }) => {
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

	const hideNotifications = () => {
		onHide();
	};

	return (
		<div className="notifications">
			<div className="notifications__header">
				<IconButton onClick={hideNotifications} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Notifications')}</h3>
			</div>

			<div className="notifications__body">
				{isLoaded && (
					<div className="notifications__body__empty">
						{t('You have no notifications')}
					</div>
				)}
			</div>
		</div>
	);
};

export default Notifications;
