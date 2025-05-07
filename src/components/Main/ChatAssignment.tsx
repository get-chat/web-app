import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
} from '@mui/material';
import '../../styles/ChatAssignment.css';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { prepareUserLabel, sortUsers } from '@src/helpers/UserHelper';
import { AxiosError } from 'axios';
import { sortGroups } from '@src/helpers/GroupsHelper';
import { GroupList } from '@src/types/groups';
import { fetchGroups } from '@src/api/groupsApi';
import {
	fetchChatAssignment,
	updateChatAssignment,
} from '@src/api/chatAssignmentApi';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	waId: string;
}

const ChatAssignment: React.FC<Props> = ({ open, setOpen, waId }) => {
	const users = useAppSelector((state) => state.users.value);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const isAdmin = currentUser?.profile?.role === 'admin';

	const { t } = useTranslation();

	const [isLoading, setLoading] = useState(true);
	const [groups, setGroups] = useState<GroupList>({});
	const [assignedToUser, setAssignedToUser] = useState<number | null>(null);
	const [assignedGroup, setAssignedGroup] = useState<number | null>(null);
	const [tempAssignedToUser, setTempAssignedToUser] = useState('null');
	const [tempAssignedGroup, setTempAssignedGroup] = useState('null');

	useEffect(() => {
		listGroups();
	}, []);

	const close = () => {
		setOpen(false);
	};

	const retrieveChatAssignment = async () => {
		try {
			const data = await fetchChatAssignment(waId);
			// Data on server
			setAssignedToUser(data.assigned_to_user);
			setAssignedGroup(data.assigned_group);

			// UI data
			setTempAssignedToUser(data.assigned_to_user?.toString() ?? 'null');
			setTempAssignedGroup(data.assigned_group?.toString() ?? 'null');

			setLoading(false);
		} catch (error: any | AxiosError) {
			console.error(error);
			if (error?.response?.status === 403) {
				setLoading(false);
			} else {
				close();
			}
		}
	};

	const doUpdateChatAssignment = async () => {
		try {
			await updateChatAssignment({
				wa_id: waId,
				assigned_to_user:
					tempAssignedToUser === 'null' ? null : parseInt(tempAssignedToUser),
				assigned_group:
					tempAssignedGroup === 'null' ? null : parseInt(tempAssignedGroup),
			});
		} catch (error: any | AxiosError) {
			console.error(error);
			if (error?.response?.status === 403) {
				window.displayCustomError(
					'This chat could not be assigned as its assignments have been changed by another user recently.'
				);
			}
		} finally {
			close();
		}
	};

	const listGroups = async () => {
		try {
			const data = await fetchGroups();
			const preparedGroups: GroupList = {};
			data.results.forEach((item) => (preparedGroups[item.id] = item));
			setGroups(preparedGroups);
		} catch (error) {
			console.error(error);
		} finally {
			await retrieveChatAssignment();
		}
	};

	const handleUserChange = (event: SelectChangeEvent) => {
		const userId = event.target.value;
		setTempAssignedToUser(userId);

		// Set group automatically, if assigned group was blank
		if (!assignedGroup) {
			const firstGroupOfUser = users[userId]?.groups?.[0]?.id?.toString();
			setTempAssignedGroup(firstGroupOfUser);
		}
	};

	const handleGroupChange = (event: SelectChangeEvent) => {
		setTempAssignedGroup(event.target.value);
	};

	const canChangeUserAssigment = useMemo(
		() =>
			assignedToUser === currentUser?.id || assignedToUser === null || isAdmin,
		[assignedToUser, currentUser?.id, isAdmin]
	);

	const canChangeGroupAssigment = useMemo(
		() => assignedGroup === null || isAdmin,
		[assignedGroup, isAdmin]
	);

	return (
		<Dialog open={open} onClose={close} className="chatAssignmentWrapper">
			<DialogTitle>Assign chat</DialogTitle>
			<DialogContent className="chatAssignment">
				{isAdmin && (
					<div className="chatAssignmentWrapper__main_message">
						<DialogContentText>
							{t('You can assign this chat to a user or a group.')}
						</DialogContentText>
					</div>
				)}

				{!isAdmin && (
					<div className="chatAssignmentWrapper__message">
						{canChangeUserAssigment ? (
							<DialogContentText>
								{t(
									'You can assign this chat to yourself and unassign from yourself.'
								)}
							</DialogContentText>
						) : (
							<DialogContentText>
								{t(
									'This chat is already assigned to another user. You can change the assignment of this chat only if the current person will unassign themselves or someone with admin access will clear the assignment.'
								)}
							</DialogContentText>
						)}
					</div>
				)}

				<FormControl
					variant="standard"
					fullWidth={true}
					disabled={!canChangeUserAssigment}
				>
					<InputLabel id="assign-user-select-label">User</InputLabel>
					<Select
						variant="standard"
						labelId="assign-user-select-label"
						id="assign-user-select"
						value={tempAssignedToUser}
						onChange={handleUserChange}
					>
						<MenuItem value="null">{t('Unassigned')}</MenuItem>
						{sortUsers(users).map((user) => (
							<MenuItem
								key={user.id?.toString()}
								value={user.id?.toString()}
								disabled={isAdmin ? false : user.id !== currentUser?.id}
							>
								{prepareUserLabel(user)}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				{!isAdmin && (
					<div className="chatAssignmentWrapper__message">
						{canChangeGroupAssigment ? (
							<DialogContentText>
								{t('You can assign this chat to a group.')}
							</DialogContentText>
						) : (
							<DialogContentText>
								{t(
									'This chat is already assigned to a group. You can change the assignment of this chat only if someone with admin access will	clear the assignment.'
								)}
							</DialogContentText>
						)}
					</div>
				)}

				<FormControl
					variant="standard"
					fullWidth={true}
					disabled={!canChangeGroupAssigment}
				>
					<InputLabel id="assign-group-select-label">Group</InputLabel>
					<Select
						variant="standard"
						labelId="assign-group-select-label"
						id="assign-group-select"
						value={tempAssignedGroup}
						onChange={handleGroupChange}
					>
						<MenuItem value="null">{t('Unassigned')}</MenuItem>
						{sortGroups(groups)?.map((group) => (
							<MenuItem key={group.id.toString()} value={group.id.toString()}>
								{group.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					Close
				</Button>
				{(canChangeUserAssigment || canChangeGroupAssigment) && (
					<Button color="primary" onClick={doUpdateChatAssignment}>
						{t('Update')}
					</Button>
				)}
			</DialogActions>

			{isLoading && (
				<div className="chatAssignmentWrapper__loading">
					<CircularProgress size={28} />
				</div>
			)}
		</Dialog>
	);
};
export default ChatAssignment;
