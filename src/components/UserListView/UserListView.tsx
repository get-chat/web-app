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
import {
	overlayPanelAnimation,
	PanelTransitionProps,
} from '@src/styles/panelTransitions';
import PanelHeader from '@src/components/PanelHeader';
import { cn } from '@src/lib/utils';
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
		<div
			className={cn(
				'absolute inset-0 flex flex-col bg-white',
				overlayPanelAnimation(isExiting)
			)}
			onAnimationEnd={onAnimationEnd}
		>
			<PanelHeader title={t('Users')} icon={<CloseIcon />} onClose={onHide} />
			{(canChangeAvailability || canCreateUsers) && (
				<div className="flex flex-col gap-3 p-3.75">
					{canCreateUsers && (
						<Button
							variant="ghost"
							color="neutral"
							className="h-auto w-full justify-start gap-2 border border-gray-light bg-white px-3.75 py-2.75 text-foreground has-[>svg]:px-3.75 hover:bg-(--color-primary-transparent) hover:shadow-[inset_0_0_0_1px_var(--color-primary),var(--shadow-md)] [&_.app-icon]:size-5! [&_.app-icon]:text-primary!"
							onClick={() => setCreateUserDialogVisible(true)}
							data-test-id="users-create-user-button"
						>
							<PersonAddAltIcon />
							{t('Create new user')}
						</Button>
					)}
					{canChangeAvailability && (
						<div className="flex items-start gap-1.75 text-[12.5px] leading-[1.45] text-muted-foreground [&_.app-icon]:mt-px [&_.app-icon]:shrink-0 [&_.app-icon]:text-[16px]!">
							<InfoOutlinedIcon />
							<span>
								{t('As an admin, you can change active status of users.')}
							</span>
						</div>
					)}
				</div>
			)}

			{isLoading ? (
				<div className="flex justify-center p-3.75">
					<Spinner size={40} className="text-primary" />
				</div>
			) : error ? (
				<div className="flex bg-gray-lighter p-3.75 text-[14px]">
					{t(error)}
				</div>
			) : (
				<div className="relative flex-1 overflow-x-hidden overflow-y-auto">
					{sortUsers(users).map((user) => (
						<div
							key={user.id}
							className="flex items-center justify-between gap-2.5 px-3.75 py-2.5"
						>
							<div className="flex items-center gap-2.5 overflow-hidden text-[14px] font-semibold text-ellipsis whitespace-nowrap">
								<CustomAvatar generateBgColorBy={user.username}>
									{generateInitialsHelper(user.username)}
								</CustomAvatar>
								<div className="flex min-w-0 flex-1 flex-col">
									<div className="truncate text-[14px] font-semibold text-foreground">
										{user.username}
									</div>
									{user.email && (
										<div className="truncate text-[13px] font-normal text-foreground">
											{user.email}
										</div>
									)}
									<div className="truncate text-[12px] font-medium text-muted-foreground">
										{t(getUserRoleLabel(user.profile?.role))}
									</div>
								</div>
							</div>
							{isUserAvailabilityFeatureEnabled && (
								<div
									className={cn(
										'flex shrink-0 items-center justify-between gap-2.5 rounded-[20px] text-[14px] transition-[background-color] duration-200 ease-in-out',
										canChangeAvailability
											? 'w-[140px] py-0 pr-0 pl-3.75'
											: 'px-3.75 py-1',
										user.profile.is_available
											? 'bg-success-soft text-success'
											: 'bg-warning-soft text-warning'
									)}
								>
									<div className="truncate">
										{user.profile.is_available ? t('Active') : t('Inactive')}
									</div>
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
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<CreateUserDialog
				open={isCreateUserDialogVisible}
				setOpen={setCreateUserDialogVisible}
				onCreated={listUsers}
			/>
		</div>
	);
};

export default UserListView;
