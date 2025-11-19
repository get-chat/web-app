import { Switch } from '@mui/material';
import * as Styled from './UserAvailability.styles';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { useEffect, useState } from 'react';

const UserAvailability = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const { t } = useTranslation();

	const [isAvailable, setAvailable] = useState(false);

	useEffect(() => {
		setAvailable(currentUser?.profile?.is_available ?? false);
	}, [currentUser?.profile?.is_available]);

	return (
		<Styled.Container $isAvailable={isAvailable}>
			<div>{t('You are inactive now. Tap to change your status.')}</div>
			<Switch
				defaultChecked={false}
				checked={isAvailable}
				color={isAvailable ? 'success' : 'warning'}
			/>
		</Styled.Container>
	);
};

export default UserAvailability;
