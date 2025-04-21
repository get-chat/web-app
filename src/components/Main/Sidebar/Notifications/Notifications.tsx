import React, { useEffect, useRef, useState } from 'react';
import * as Styled from './Notifications.styles';
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
		<Styled.NotificationsContainer>
			<Styled.Header>
				<IconButton onClick={hideNotifications} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Notifications')}</h3>
			</Styled.Header>

			<Styled.Body>
				{isLoaded && (
					<Styled.EmptyState>
						{t('You have no notifications')}
					</Styled.EmptyState>
				)}
			</Styled.Body>
		</Styled.NotificationsContainer>
	);
};

export default Notifications;
