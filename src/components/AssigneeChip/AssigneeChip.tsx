import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Divider, ListItemIcon, MenuItem, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAssigneeChip from '@src/components/AssigneeChip/useAssigneeChip';
import CheckIcon from '@mui/icons-material/Check';
import { prepareUserLabel, sortUsers } from '@src/helpers/UserHelper';
import { sortGroups } from '@src/helpers/GroupsHelper';
import * as Styled from './AssigneeChip.styles';

export type AssigneeType = 'user' | 'group';

interface Props {
	assigneeType: AssigneeType;
	name?: string;
	secondaryName?: string;
	tooltip?: string | JSX.Element;
	dense?: boolean;
	assignedUserId?: number;
	assignedGroupId?: number;
	isActionable?: boolean;
	onAction?: (userId?: number | null, groupId?: number | null) => void;
}

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

	const selectUser = (userId?: number | null) => {
		onAction?.(userId);
		hideMenu();
	};

	const selectGroup = (groupId?: number | null) => {
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
				<Styled.Container
					className={`
          ${Boolean(menuAnchorEl) ? 'menuOpen' : ''}
        `}
					$isClickable={isActionable}
					onClick={isActionable ? displayMenu : undefined}
				>
					<Styled.Avatar
						as={CustomAvatar}
						unassigned={!Boolean(name)}
						generateBgColorBy={name}
					>
						{assigneeType === 'group' ? (
							<GroupIcon />
						) : name ? (
							generateInitialsHelper(name)
						) : (
							<PersonIcon />
						)}
					</Styled.Avatar>

					{(!dense || name) && (
						<Styled.Name $isWider={isActionable && !!secondaryName}>
							{name ?? (!dense ? t('Unassigned') : '')}
							{!dense && secondaryName && ', ' + secondaryName}
						</Styled.Name>
					)}

					{isActionable && (
						<Styled.ActionIcon size="small">
							<ExpandMoreIcon />
						</Styled.ActionIcon>
					)}
				</Styled.Container>
			</Tooltip>

			{isActionable && (
				<Styled.StyledMenu
					anchorEl={menuAnchorEl}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					open={Boolean(menuAnchorEl)}
					onClose={hideMenu}
					elevation={3}
				>
					<Styled.MenuHeader>
						<PersonIcon /> {t('Users')}
					</Styled.MenuHeader>

					<MenuItem
						className="menuItem menuItemDefault"
						onClick={() => selectUser(null)}
						selected={!assignedUserId}
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
							className={`menuItem ${
								user.id !== assignedUserId ? 'menuItemDefault' : ''
							}`}
							key={user.id}
							value={user.id}
							onClick={() => selectUser(user.id)}
							selected={user.id === assignedUserId}
						>
							{user.id === assignedUserId && (
								<ListItemIcon>
									<CheckIcon />
								</ListItemIcon>
							)}
							{prepareUserLabel(user)}
						</MenuItem>
					))}

					<Divider />

					<Styled.MenuHeader>
						<GroupIcon /> {t('Groups')}
					</Styled.MenuHeader>

					<MenuItem
						className="menuItem menuItemDefault"
						onClick={() => selectGroup(null)}
						selected={!assignedGroupId}
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
							className={`menuItem ${
								group.id !== assignedGroupId ? 'menuItemDefault' : ''
							}`}
							key={group.id}
							value={group.id}
							onClick={() => selectGroup(group.id)}
							selected={group.id === assignedGroupId}
						>
							{group.id === assignedGroupId && (
								<ListItemIcon>
									<CheckIcon />
								</ListItemIcon>
							)}
							{group.name}
						</MenuItem>
					))}
				</Styled.StyledMenu>
			)}
		</>
	);
};

export default AssigneeChip;
