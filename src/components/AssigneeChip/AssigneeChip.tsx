import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import styles from './AssigneeChip.module.css';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import classNames from 'classnames/bind';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
				<IconButton
					className={styles.actionIcon}
					onClick={console.log}
					size="small"
				>
					<ExpandMoreIcon />
				</IconButton>
			)}
		</div>
	);
};

export default AssigneeChip;
