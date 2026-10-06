import React, { useEffect, useMemo, useState } from 'react';
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
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Field, FieldLabel } from '@src/components/ui/field';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';
import { Spinner } from '@src/components/ui/spinner';

// Text under the dialog's description, styled like it
const messageClassName = 'text-sm text-muted-foreground';

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

	const handleUserChange = (userId: string) => {
		setTempAssignedToUser(userId);

		// Set group automatically, if assigned group was blank
		if (!assignedGroup) {
			const firstGroupOfUser = users[userId]?.groups?.[0]?.id?.toString();
			setTempAssignedGroup(firstGroupOfUser);
		}
	};

	const handleGroupChange = (groupId: string) => {
		setTempAssignedGroup(groupId);
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
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Assign chat</DialogTitle>
				</DialogHeader>
				<DialogBody>
					{isAdmin && (
						<div className="mb-6">
							<DialogDescription>
								{t('You can assign this chat to a user or a group.')}
							</DialogDescription>
						</div>
					)}

					{!isAdmin && (
						<div className="mb-1.25">
							{canChangeUserAssigment ? (
								<DialogDescription>
									{t(
										'You can assign this chat to yourself and unassign from yourself.'
									)}
								</DialogDescription>
							) : (
								<DialogDescription>
									{t(
										'This chat is already assigned to another user. You can change the assignment of this chat only if the current person will unassign themselves or someone with admin access will clear the assignment.'
									)}
								</DialogDescription>
							)}
						</div>
					)}

					<Field
						className="mb-[15px] gap-1"
						data-disabled={!canChangeUserAssigment}
					>
						<FieldLabel htmlFor="assign-user-select">User</FieldLabel>
						<Select
							value={tempAssignedToUser ?? ''}
							onValueChange={handleUserChange}
							disabled={!canChangeUserAssigment}
						>
							<SelectTrigger id="assign-user-select" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="null">{t('Unassigned')}</SelectItem>
								{sortUsers(users).map((user) => (
									<SelectItem
										key={user.id?.toString()}
										value={user.id?.toString()}
										disabled={isAdmin ? false : user.id !== currentUser?.id}
									>
										{prepareUserLabel(user)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					{!isAdmin && (
						<div className="mb-1.25">
							{/* Plain text, not a second DialogDescription: the dialog
							    points at one description */}
							{canChangeGroupAssigment ? (
								<p className={messageClassName}>
									{t('You can assign this chat to a group.')}
								</p>
							) : (
								<p className={messageClassName}>
									{t(
										'This chat is already assigned to a group. You can change the assignment of this chat only if someone with admin access will clear the assignment.'
									)}
								</p>
							)}
						</div>
					)}

					<Field
						className="mb-[15px] gap-1"
						data-disabled={!canChangeGroupAssigment}
					>
						<FieldLabel htmlFor="assign-group-select">Group</FieldLabel>
						<Select
							// Can be undefined when the chosen user has no group; ''
							// shows an empty field, as MUI did
							value={tempAssignedGroup ?? ''}
							onValueChange={handleGroupChange}
							disabled={!canChangeGroupAssigment}
						>
							<SelectTrigger id="assign-group-select" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="null">{t('Unassigned')}</SelectItem>
								{sortGroups(groups)?.map((group) => (
									<SelectItem
										key={group.id.toString()}
										value={group.id.toString()}
									>
										{group.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						Close
					</Button>
					{(canChangeUserAssigment || canChangeGroupAssigment) && (
						<Button
							variant="ghost"
							color="primary"
							onClick={doUpdateChatAssignment}
						>
							{t('Update')}
						</Button>
					)}
				</DialogFooter>

				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-white">
						<Spinner size={28} className="text-primary" />
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
export default ChatAssignment;
