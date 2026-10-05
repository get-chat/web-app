import * as Styled from './UserListView.styles';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import PersonAddAltIcon from '@src/components/icons/PersonAdd';
import InfoOutlinedIcon from '@src/components/icons/Info';
import CloseIcon from '@src/components/icons/Close';
import { fetchUsers, updateUserAvailability } from '@src/api/usersApi';
import { User, UserAvailabilityEvent, UserList } from '@src/types/users';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { AxiosError } from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_USER_AVAILABILITY } from '@src/Constants';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { useAppSelector } from '@src/store/hooks';
import { getUserRoleLabel, sortUsers } from '@src/helpers/UserHelper';
import CreateUserDialog from '@src/components/CreateUserDialog';
import { Button } from '@src/components/ui/button';
import { Spinner } from '@src/components/ui/spinner';
import { Switch } from '@src/components/ui/switch';

interface Props extends PanelTransitionProps {
	onHide: () => void;
}

const UserListView: React.FC<Props> = ({
	onHide,
	isExiting,
	onAnimationEnd,
}) => {
	const { t } = useTranslation();

	const currentUser = useAppSelector((state) => state.currentUser.value);
	const isReadOnly = useAppSelector((state) => state.UI.isReadOnly);
	const isUserAvailabilityFeatureEnabled = useAppSelector(
		(state) => state.isUserAvailabilityFeatureEnabled.value
	);

	// Listing users is allowed for everyone, but the API limits changing
	// availability to the user themselves or an admin
	const isAdmin = currentUser?.profile?.role === 'admin';
	const canChangeAvailability = isUserAvailabilityFeatureEnabled && isAdmin;
	const canCreateUsers = isAdmin && !isReadOnly;

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>();
	const [users, setUsers] = useState<UserList>({});
	const [isCreateUserDialogVisible, setCreateUserDialogVisible] =
		useState(false);

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
		setError(undefined);
		try {
			const data = await fetchUsers(1000);
			const userList: UserList = {};
			data.results.forEach((user: User) => {
				userList[user.id] = user;
			});
			setUsers(userList);
		} catch (error) {
			console.error('Error in listUsers', error);
			setError('Users could not be loaded.');
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
		<Styled.Container $isExiting={isExiting} onAnimationEnd={onAnimationEnd}>
			<Styled.Header>
				<Button variant="ghost" color="neutral" size="icon-xl" onClick={onHide}>
					<CloseIcon />
				</Button>

				<h3>{t('Users')}</h3>
			</Styled.Header>
			{(canChangeAvailability || canCreateUsers) && (
				<Styled.Actions>
					{canCreateUsers && (
						<Styled.CreateUserButton
							variant="ghost"
							color="neutral"
							onClick={() => setCreateUserDialogVisible(true)}
							data-test-id="users-create-user-button"
						>
							<PersonAddAltIcon />
							{t('Create new user')}
						</Styled.CreateUserButton>
					)}
					{canChangeAvailability && (
						<Styled.Hint>
							<InfoOutlinedIcon />
							<span>
								{t('As an admin, you can change active status of users.')}
							</span>
						</Styled.Hint>
					)}
				</Styled.Actions>
			)}

			{isLoading ? (
				<Styled.LoadingContainer>
					<Spinner size={40} className="text-primary" />
				</Styled.LoadingContainer>
			) : error ? (
				<Styled.Description>{t(error)}</Styled.Description>
			) : (
				<Styled.Body>
					{sortUsers(users).map((user) => (
						<Styled.UserItem key={user.id}>
							<Styled.UserMeta>
								<CustomAvatar generateBgColorBy={user.username}>
									{generateInitialsHelper(user.username)}
								</CustomAvatar>
								<Styled.UserInfo>
									<Styled.UserUsername>{user.username}</Styled.UserUsername>
									{user.email && (
										<Styled.UserEmail>{user.email}</Styled.UserEmail>
									)}
									<Styled.UserRole>
										{t(getUserRoleLabel(user.profile?.role))}
									</Styled.UserRole>
								</Styled.UserInfo>
							</Styled.UserMeta>
							{isUserAvailabilityFeatureEnabled && (
								<Styled.UserAvailability
									$isAvailable={user.profile.is_available}
									$hasSwitch={canChangeAvailability}
								>
									<Styled.UserAvailabilityLabel>
										{user.profile.is_available ? t('Active') : t('Inactive')}
									</Styled.UserAvailabilityLabel>
									{canChangeAvailability && (
										<Switch
											// MUI's success green when on; the margins keep MUI's
											// footprint inside the pill
											color="success"
											className="my-[9px] mr-3"
											checked={user.profile.is_available}
											onClick={() =>
												toggleUserAvailability(
													user.id,
													user.profile.is_available
												)
											}
										/>
									)}
								</Styled.UserAvailability>
							)}
						</Styled.UserItem>
					))}
				</Styled.Body>
			)}

			<CreateUserDialog
				open={isCreateUserDialogVisible}
				setOpen={setCreateUserDialogVisible}
				onCreated={listUsers}
			/>
		</Styled.Container>
	);
};

export default UserListView;
