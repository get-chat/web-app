import React, { MouseEvent, useState } from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import styles from './AssigneeChip.module.css';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import classNames from 'classnames/bind';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { UserList } from '@src/api/responses/UsersResponse';

enum AssigneeType {
	user = 'user',
	group = 'group',
}

interface Props {
	assigneeType: AssigneeType;
	name?: string;
	isActionable?: boolean;
}

const cx = classNames.bind(styles);

const AssigneeChip: React.FC<Props> = ({
	assigneeType,
	name,
	isActionable = false,
}) => {
	const { t } = useTranslation();

	let users: UserList = {};

	if (isActionable) {
		users = useAppSelector((state) => state.users.value);
	}

	const [anchorEl, setAnchorEl] = useState<Element>();

	const displayMenu = (event: MouseEvent) => {
		if (event.currentTarget instanceof Element) {
			setAnchorEl(event.currentTarget);
		}
	};

	const hideMenu = () => {
		setAnchorEl(undefined);
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

			<span className={styles.name}>{name ?? t('Unassigned')}</span>

			{isActionable && (
				<>
					<IconButton
						className={styles.actionIcon}
						onClick={displayMenu}
						size="small"
					>
						<ExpandMoreIcon />
					</IconButton>

					{assigneeType === AssigneeType.user && (
						<Menu
							anchorEl={anchorEl}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							keepMounted
							open={Boolean(anchorEl)}
							onClose={hideMenu}
							elevation={3}
						>
							{Object.values(users)?.map((user) => (
								// @ts-ignore
								<MenuItem key={user.id} value={user.id}>
									{user.prepareUserLabel()}
								</MenuItem>
							))}
						</Menu>
					)}
				</>
			)}
		</div>
	);
};

export default AssigneeChip;
