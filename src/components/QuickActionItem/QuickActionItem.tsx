import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import React, { memo } from 'react';
import styles from './QuickActionItem.module.css';

export type Props = {
	item: QuickActionType;
	isSelected: boolean;
	itemProps: {};
};

const QuickActionItem: React.FC<Props> = ({ item, isSelected, itemProps }) => {
	return (
		<div
			className={
				styles.container +
				' ' +
				(isSelected ? styles.containerSelected + ' active' : '')
			}
			{...itemProps}
			//onClick={handleClick}
		>
			<div>
				<div className={styles.command + ' bold'}>
					{item.isStatic ? item.command : item.command.substring(1)}
				</div>{' '}
				{item.parameterHint} {item.parameters?.join(' ')}
			</div>
			<div className={styles.description}>{item.description}</div>
		</div>
	);
};

export default memo(QuickActionItem);
