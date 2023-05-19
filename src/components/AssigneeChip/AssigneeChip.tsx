import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import styles from './AssigneeChip.module.css';
import GroupIcon from '@mui/icons-material/Group';
import classNames from 'classnames/bind';

enum AssigneeType {
	user = 'user',
	group = 'group',
}

interface Props {
	assigneeType: AssigneeType;
	name?: string;
}

const cx = classNames.bind(styles);

const AssigneeChip: React.FC<Props> = ({ assigneeType, name }) => {
	return (
		<div
			className={cx({
				assigneeChip: true,
				container: true,
			})}
		>
			<CustomAvatar className={styles.avatar} generateBgColorBy={name}>
				{assigneeType === 'group' ? (
					<GroupIcon />
				) : (
					generateInitialsHelper(name)
				)}
			</CustomAvatar>
			<span>{name}</span>
		</div>
	);
};

export default AssigneeChip;
