import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import React, { memo } from 'react';
import styles from './QuickActionItem.module.css';

export type Props = {
	item: QuickActionType;
	isSelected: boolean;
	onRun: (item: QuickActionType) => void;
};

const QuickActionItem: React.FC<Props> = ({ item, isSelected, onRun }) => {
	const handleClick = () => {
		// Running it in setTimeout to avoid incorrect click outside detections
		setTimeout(() => {
			onRun(item);
		}, 0);
	};

	return (
		<div
			className={
				styles.container +
				' ' +
				(isSelected ? styles.containerSelected + ' active' : '')
			}
			onClick={handleClick}
		>
			<div>
				<span className="bold">
					{item.isStatic ? item.command : item.command.substring(1)}
				</span>{' '}
				{item.parameterHint} {item.parameters?.join(' ')}
			</div>
			<div className={styles.descriptionContainer}>{item.description}</div>
		</div>
	);
};

export default memo(QuickActionItem);
