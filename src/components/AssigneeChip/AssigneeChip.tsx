import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import styles from './AssigneeChip.module.css';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import classNames from 'classnames/bind';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	ButtonBase,
	Divider,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAssigneeChip from '@src/components/AssigneeChip/useAssigneeChip';
import CheckIcon from '@mui/icons-material/Check';
import { sortUsers } from '@src/helpers/UsersHelper';
import { sortGroups } from '@src/helpers/GroupsHelper';

export type AssigneeType = 'user' | 'group';

interface Props {
	assigneeType: AssigneeType;
	name?: string;
	secondaryName?: string;
	tooltip?: string | JSX.Element;
	dense?: boolean;
	assignedUserId?: Number;
	assignedGroupId?: Number;
	isActionable?: boolean;
	onAction?: (userId?: Number | null, groupId?: Number | null) => void;
}

const cx = classNames.bind(styles);

const AssigneeChip: React.FC<Props> = ({
	assigneeType,
	name,
	secondaryName,
	tooltip,
	dense = false,
	assignedUserId,
	assignedGroupId,
	isActionable = false,
	onAction,
}) => {
	const { t } = useTranslation();

	const { menuAnchorEl, displayMenu, hideMenu, users, groups } =
		useAssigneeChip({
			assigneeType,
			isActionable,
		});

	const selectUser = (userId?: Number | null) => {
		onAction?.(userId);
		hideMenu();
	};

	const selectGroup = (groupId?: Number | null) => {
		onAction?.(undefined, groupId);
		hideMenu();
	};

	return (
		<>
			<Tooltip
				placement="top"
				title={tooltip}
				disableInteractive
				PopperProps={{ style: { zIndex: 1 } }}
			>
				<ButtonBase
					component="div"
					className={cx({
						assigneeChip: true,
						container: true,
						clickable: isActionable,
						menuOpen: Boolean(menuAnchorEl),
					})}
					onClick={isActionable ? displayMenu : undefined}
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

					{(!dense || name) && (
						<span
							className={cx({
								name: true,
								wider: isActionable && secondaryName,
							})}
						>
							{name ?? (!dense ? t('Unassigned') : '')}
							{!dense && secondaryName && ', ' + secondaryName}
						</span>
					)}

					{isActionable && (
						<IconButton className={styles.actionIcon} size="small">
							<ExpandMoreIcon />
						</IconButton>
					)}
				</ButtonBase>
			</Tooltip>

			{isActionable && (
				<Menu
					className={styles.menu}
					anchorEl={menuAnchorEl}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					keepMounted
					open={Boolean(menuAnchorEl)}
					onClose={hideMenu}
					elevation={3}
				>
					<h6 className={styles.menuHeader}>
						<PersonIcon /> {t('Users')}
					</h6>

					<MenuItem
						className={cx({
							menuItem: true,
							menuItemDefault: assignedUserId,
						})}
						onClick={() => selectUser(null)}
					>
						{!assignedUserId && (
							<ListItemIcon>
								<CheckIcon />
							</ListItemIcon>
						)}
						{t('Unassigned')}
					</MenuItem>

					{sortUsers(users).map((user) => (
						<MenuItem
							className={cx({
								menuItem: true,
								menuItemDefault: user.id !== assignedUserId,
							})}
							// @ts-ignore
							key={user.id}
							value={user.id}
							onClick={() => selectUser(user.id)}
						>
							{user.id === assignedUserId && (
								<ListItemIcon>
									<CheckIcon />
								</ListItemIcon>
							)}
							{user.prepareUserLabel()}
						</MenuItem>
					))}

					<Divider />

					<h6 className={styles.menuHeader}>
						<GroupIcon /> {t('Groups')}
					</h6>

					<MenuItem
						className={cx({
							menuItem: true,
							menuItemDefault: assignedGroupId,
						})}
						onClick={() => selectGroup(null)}
					>
						{!assignedGroupId && (
							<ListItemIcon>
								<CheckIcon />
							</ListItemIcon>
						)}
						{t('Unassigned')}
					</MenuItem>

					{sortGroups(groups).map((group) => (
						<MenuItem
							className={cx({
								menuItem: true,
								menuItemDefault: group.id !== assignedGroupId,
							})}
							// @ts-ignore
							key={group.id}
							value={group.id}
							onClick={() => selectGroup(group.id)}
						>
							{group.id === assignedGroupId && (
								<ListItemIcon>
									<CheckIcon />
								</ListItemIcon>
							)}
							{group.name}
						</MenuItem>
					))}
				</Menu>
			)}
		</>
	);
};

export default AssigneeChip;
