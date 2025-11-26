import * as Styled from './UserListView.styles';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { CircularProgress, IconButton, Switch } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchUsers, updateUserAvailability } from '@src/api/usersApi';
import { User, UserAvailabilityEvent, UserList } from '@src/types/users';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { AxiosError } from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_USER_AVAILABILITY } from '@src/Constants';

interface Props {
	onHide: () => void;
}

const UserListView: React.FC<Props> = ({ onHide }) => {
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [users, setUsers] = useState<UserList>({});

	useEffect(() => {
		listUsers();
	}, []);

	useEffect(() => {
		const onUserAvailabilityEvent = function (
			msg: string,
			data: UserAvailabilityEvent
		) {
			updateSingleUserAvailability(data.user.id, data.is_available);
		};

		const userAvailabilityEventToken = PubSub.subscribe(
			EVENT_TOPIC_USER_AVAILABILITY,
			onUserAvailabilityEvent
		);

		return () => {
			PubSub.unsubscribe(userAvailabilityEventToken);
		};
	}, [users]);

	const listUsers = async () => {
		setIsLoading(true);
		try {
			const data = await fetchUsers(1000);
			const userList: UserList = {};
			data.results.forEach((user: User) => {
				userList[user.id] = user;
			});
			setUsers(userList);
		} catch (error) {
			console.error('Error in listUsers', error);
		} finally {
			setIsLoading(false);
		}
	};

	const updateSingleUserAvailability = (
		userId: number,
		isAvailable: boolean
	) => {
		setUsers((prev) => ({
			...prev,
			[userId]: {
				...prev[userId],
				profile: {
					...prev[userId].profile,
					is_available: isAvailable,
				},
			},
		}));
	};

	const toggleUserAvailability = async (
		userId: number,
		isAvailable: boolean
	) => {
		try {
			const data = await updateUserAvailability(userId, {
				is_available: !isAvailable,
			});
			// Update local state
			updateSingleUserAvailability(userId, data.is_available);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return (
		<Styled.Container>
			<Styled.Header>
				<IconButton onClick={onHide} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Users')}</h3>
			</Styled.Header>
			<Styled.Description>
				{t('As an admin, you can change active status of users.')}
			</Styled.Description>

			{isLoading ? (
				<Styled.LoadingContainer>
					<CircularProgress />
				</Styled.LoadingContainer>
			) : (
				<Styled.Body>
					{Object.values(users).map((user) => (
						<Styled.UserItem>
							<Styled.UserMeta>
								<CustomAvatar generateBgColorBy={user.username}>
									{generateInitialsHelper(user.username)}
								</CustomAvatar>
								<Styled.UserInfo>
									<Styled.UserUsername>{user.username}</Styled.UserUsername>
									<Styled.UserRole>{user.profile.role}</Styled.UserRole>
								</Styled.UserInfo>
							</Styled.UserMeta>
							<Styled.UserAvailability $isAvailable={user.profile.is_available}>
								<Styled.UserAvailabilityLabel>
									{user.profile.is_available ? t('Active') : t('Inactive')}
								</Styled.UserAvailabilityLabel>
								<Switch
									color={user.profile.is_available ? 'success' : 'warning'}
									checked={user.profile.is_available}
									onClick={() =>
										toggleUserAvailability(user.id, user.profile.is_available)
									}
								/>
							</Styled.UserAvailability>
						</Styled.UserItem>
					))}
				</Styled.Body>
			)}
		</Styled.Container>
	);
};

export default UserListView;
