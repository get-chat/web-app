import React, { useState } from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import useAssigneeChip from '@src/components/AssigneeChip/useAssigneeChip';
import CheckIcon from '@mui/icons-material/Check';
import { prepareUserLabel, sortUsers } from '@src/helpers/UserHelper';
import { sortGroups } from '@src/helpers/GroupsHelper';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import { cn } from '@src/lib/utils';
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

// Users / Groups headings of the menu
const menuHeaderClassName =
	'flex items-center gap-[5px] [&_svg]:size-[13px]! [&_svg]:text-menu-muted!';

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

	const { users, groups } = useAssigneeChip({
		assigneeType,
		isActionable,
	});

	// Controlled so the chip can carry the "menuOpen" class, which keeps an
	// empty chip visible in the chat list while its menu is open
	const [isMenuOpen, setMenuOpen] = useState(false);

	const hideMenu = () => {
		setMenuOpen(false);
	};

	const selectUser = (userId?: number | null) => {
		onAction?.(userId);
		hideMenu();
	};

	const selectGroup = (groupId?: number | null) => {
		onAction?.(undefined, groupId);
		hideMenu();
	};

	const chip = (
		<Styled.Container
			className={isMenuOpen ? 'menuOpen' : ''}
			$isClickable={isActionable}
			role={isActionable ? 'button' : undefined}
			tabIndex={isActionable ? 0 : undefined}
		>
			<Styled.Avatar
				as={CustomAvatar}
				$unassigned={!Boolean(name)}
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
				<Styled.ActionIcon>
					<ExpandMoreIcon />
				</Styled.ActionIcon>
			)}
		</Styled.Container>
	);

	if (!isActionable) {
		return (
			<SimpleTooltip title={tooltip} side="top" disableHoverableContent>
				{chip}
			</SimpleTooltip>
		);
	}

	return (
		<DropdownMenu open={isMenuOpen} onOpenChange={setMenuOpen}>
			<SimpleTooltip title={tooltip} side="top" disableHoverableContent>
				<DropdownMenuTrigger asChild>{chip}</DropdownMenuTrigger>
			</SimpleTooltip>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel className={menuHeaderClassName}>
					<PersonIcon /> {t('Users')}
				</DropdownMenuLabel>

				<DropdownMenuItem
					className={cn(!assignedUserId && 'bg-menu-active')}
					onSelect={() => selectUser(null)}
				>
					{!assignedUserId && <CheckIcon />}
					{t('Unassigned')}
				</DropdownMenuItem>

				{sortUsers(users).map((user) => (
					<DropdownMenuItem
						className={cn(user.id === assignedUserId && 'bg-menu-active')}
						key={user.id}
						onSelect={() => selectUser(user.id)}
					>
						{user.id === assignedUserId && <CheckIcon />}
						{prepareUserLabel(user)}
					</DropdownMenuItem>
				))}

				<DropdownMenuSeparator />

				<DropdownMenuLabel className={menuHeaderClassName}>
					<GroupIcon /> {t('Groups')}
				</DropdownMenuLabel>

				<DropdownMenuItem
					className={cn(!assignedGroupId && 'bg-menu-active')}
					onSelect={() => selectGroup(null)}
				>
					{!assignedGroupId && <CheckIcon />}
					{t('Unassigned')}
				</DropdownMenuItem>

				{sortGroups(groups).map((group) => (
					<DropdownMenuItem
						className={cn(group.id === assignedGroupId && 'bg-menu-active')}
						key={group.id}
						onSelect={() => selectGroup(group.id)}
					>
						{group.id === assignedGroupId && <CheckIcon />}
						{group.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default AssigneeChip;
