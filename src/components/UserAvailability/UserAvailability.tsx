import { Switch } from '@mui/material';
import * as Styled from './UserAvailability.styles';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { updateUserAvailability } from '@src/api/usersApi';

const UserAvailability = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const { t } = useTranslation();

	const [isAvailable, setAvailable] = useState(false);

	useEffect(() => {
		setAvailable(currentUser?.profile?.is_available ?? false);
	}, [currentUser?.profile?.is_available]);

	const toggleUserAvailability = async () => {
		try {
			const data = await updateUserAvailability(currentUser?.id ?? 0, {
				is_available: !isAvailable,
			});
			setAvailable(data.is_available);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return (
		<Styled.Container $isAvailable={isAvailable}>
			<div>
				<Styled.Title>
					{isAvailable ? t('You are active now.') : t('You are inactive now.')}
				</Styled.Title>
				<Styled.Description>
					{t('Tap to change your status.')}
				</Styled.Description>
			</div>
			<Switch
				defaultChecked={false}
				checked={isAvailable}
				onClick={toggleUserAvailability}
				color={isAvailable ? 'success' : 'warning'}
			/>
		</Styled.Container>
	);
};

export default UserAvailability;
