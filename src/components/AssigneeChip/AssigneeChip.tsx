import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import styles from './AssigneeChip.module.css';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import classNames from 'classnames/bind';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAssigneeChip from '@src/components/AssigneeChip/useAssigneeChip';
import UserModel from '@src/api/models/UserModel';
import GroupModel from '@src/api/models/GroupModel';

export enum AssigneeType {
	user = 'user',
	group = 'group',
}

interface Props {
	assigneeType: AssigneeType;
	name?: string;
	isActionable?: boolean;
	onAction?: (selectedUser?: UserModel, selectedGroup?: GroupModel) => void;
}

const cx = classNames.bind(styles);

const AssigneeChip: React.FC<Props> = ({
	assigneeType,
	name,
	isActionable = false,
	onAction,
}) => {
	const { t } = useTranslation();

	const { menuAnchorEl, displayMenu, hideMenu, users, groups } =
		useAssigneeChip({
			assigneeType,
			isActionable,
		});

	const selectUser = (user?: UserModel) => {
		onAction?.(user);
		hideMenu();
	};

	const selectGroup = (group?: GroupModel) => {
		onAction?.(undefined, group);
		hideMenu();
	};

	return (
		<div
			className={cx({
				assigneeChip: true,
				container: true,
			})}
		>
			<CustomAvatar
				className={cx({
					avatar: true,
					unassigned: !Boolean(name),
				})}
				generateBgColorBy={name}
			>
				{assigneeType === 'group' ? (
					<GroupIcon />
				) : name ? (
					generateInitialsHelper(name)
				) : (
					<PersonIcon />
				)}
			</CustomAvatar>

			<span
				className={cx({
					name: true,
					wider: isActionable,
				})}
			>
				{name ?? t('Unassigned')}
			</span>

			{isActionable && (
				<>
					<IconButton
						className={styles.actionIcon}
						onClick={displayMenu}
						size="small"
					>
						<ExpandMoreIcon />
					</IconButton>

					<Menu
						anchorEl={menuAnchorEl}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}
						keepMounted
						open={Boolean(menuAnchorEl)}
						onClose={hideMenu}
						elevation={3}
					>
						<MenuItem
							onClick={() =>
								assigneeType === AssigneeType.user
									? selectUser(undefined)
									: selectGroup(undefined)
							}
						>
							{t('Unassigned')}
						</MenuItem>

						{assigneeType === AssigneeType.user &&
							Object.values(users)?.map((user) => (
								<MenuItem
									// @ts-ignore
									key={user.id}
									value={user.id}
									onClick={() => selectUser(user)}
								>
									{user.prepareUserLabel()}
								</MenuItem>
							))}

						{assigneeType === AssigneeType.group &&
							Object.values(groups)?.map((group) => (
								<MenuItem
									// @ts-ignore
									key={group.id}
									value={group.id}
									onClick={() => selectGroup(group)}
								>
									{group.name}
								</MenuItem>
							))}
					</Menu>
				</>
			)}
		</div>
	);
};

export default AssigneeChip;
