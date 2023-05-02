import React from 'react';
import RecipientInterface from '@src/api/models/interfaces/RecipientInterface';
import styles from './RecipientItem.module.css';
import CustomAvatar from '@src/components/CustomAvatar';

interface Props {
	data: RecipientInterface;
	onClick: (data: any) => void;
}

const RecipientItem: React.FC<Props> = ({ data, onClick }) => {
	return (
		<div className={styles.wrapper} onClick={onClick}>
			<div className={styles.container}>
				<div className={styles.avatarWrapper}>
					<CustomAvatar src={data.avatar} generateBgColorBy={data.name}>
						{data.initials}
					</CustomAvatar>
				</div>
				<div className={styles.info}>
					<div className={styles.name}>{data.name}</div>
				</div>
			</div>
		</div>
	);
};

export default RecipientItem;
