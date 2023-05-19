import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import styles from './AssigneeChip.module.css';
import GroupIcon from '@mui/icons-material/Group';

enum AssigneeType {
	user = 'user',
	group = 'group',
}

interface Props {
	assigneeType: AssigneeType;
	name?: string;
}

const AssigneeChip: React.FC<Props> = ({ assigneeType, name }) => {
	return (
		<div className={styles.container}>
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
