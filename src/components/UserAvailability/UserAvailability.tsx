import { Switch } from '@mui/material';
import * as Styled from './UserAvailability.styles';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { AxiosError } from 'axios';
import { updateUserAvailability } from '@src/api/usersApi';
import { setIsUserAvailable } from '@src/store/reducers/isUserAvailableReducer';

const UserAvailability = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const { t } = useTranslation();

	const isUserAvailable = useAppSelector(
		(state) => state.isUserAvailable.value
	);

	const dispatch = useAppDispatch();

	const toggleUserAvailability = async () => {
		try {
			const data = await updateUserAvailability(currentUser?.id ?? 0, {
				is_available: !isUserAvailable,
			});
			dispatch(setIsUserAvailable(data.is_available));
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return (
		<Styled.Container
			$isAvailable={isUserAvailable}
			onClick={toggleUserAvailability}
		>
			<div>
				<Styled.Title>
					{isUserAvailable
						? t('You are active now.')
						: t('You are inactive now.')}
				</Styled.Title>
				<Styled.Description>
					{t('Click to toggle your status.')}
				</Styled.Description>
			</div>
			<Switch
				checked={isUserAvailable}
				onClick={(event) => {
					event.stopPropagation();
					toggleUserAvailability();
				}}
				color={isUserAvailable ? 'success' : 'warning'}
			/>
		</Styled.Container>
	);
};

export default UserAvailability;
