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
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { useAppSelector } from '@src/store/hooks';
import { sortUsers } from '@src/helpers/UsersHelper';
import GroupsResponse, { GroupList } from '@src/api/responses/GroupsResponse';
import { AxiosError, AxiosResponse } from 'axios';
import { sortGroups } from '@src/helpers/GroupsHelper';

function ChatAssignment(props: any) {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const users = useAppSelector((state) => state.users.value);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const isAdmin = currentUser?.isAdmin ?? false;

	const { t } = useTranslation();

	const [isLoading, setLoading] = useState(true);
	const [groups, setGroups] = useState<GroupList>({});
	const [assignedToUser, setAssignedToUser] = useState(null);
	const [assignedGroup, setAssignedGroup] = useState(null);
	const [tempAssignedToUser, setTempAssignedToUser] = useState('null');
	const [tempAssignedGroup, setTempAssignedGroup] = useState('null');

	useEffect(() => {
		listGroups();
	}, []);

	const close = () => {
		props.setOpen(false);
	};

	const retrieveChatAssignment = () => {
		apiService.retrieveChatAssignmentCall(
			props.waId,
			(response: AxiosResponse) => {
				// Data on server
				setAssignedToUser(response.data.assigned_to_user);
				setAssignedGroup(response.data.assigned_group);

				// UI data
				setTempAssignedToUser(response.data.assigned_to_user ?? 'null');
				setTempAssignedGroup(response.data.assigned_group ?? 'null');

				setLoading(false);
			},
			(error: AxiosError) => {
				if (error?.response?.status === 403) {
					setLoading(false);
				} else {
					close();
				}
			}
		);
	};

	const updateChatAssignment = () => {
		apiService.updateChatAssignmentCall(
			props.waId,
			tempAssignedToUser === 'null' ? null : tempAssignedToUser,
			tempAssignedGroup === 'null' ? null : tempAssignedGroup,
			() => {
				close();
			},
			(error: AxiosError) => {
				if (error?.response?.status === 403) {
					// @ts-ignore
					window.displayCustomError(
						'This chat could not be assigned as its assignments have been changed by another user recently.'
					);
				}

				close();
			}
		);
	};

	const listGroups = () => {
		apiService.listGroupsCall(undefined, (response: AxiosResponse) => {
			const groupsResponse = new GroupsResponse(response.data);
			setGroups(groupsResponse.groups);

			// Next
			retrieveChatAssignment();
		});
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
		<Dialog open={props.open} onClose={close} className="chatAssignmentWrapper">
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
								{user.prepareUserLabel()}
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
					<Button color="primary" onClick={updateChatAssignment}>
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
}
export default ChatAssignment;
