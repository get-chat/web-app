import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import React, { memo } from 'react';
import styles from './QuickActionItem.module.css';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import BoltIcon from '@mui/icons-material/Bolt';

export type Props = {
	item: QuickActionType;
	isSelected: boolean;
	itemProps: {};
};

const QuickActionItem: React.FC<Props> = ({ item, isSelected, itemProps }) => {
	return (
		<div
			className={
				styles.container + ' ' + (isSelected ? styles.selected + ' active' : '')
			}
			{...itemProps}
		>
			<div>
				{item.isStatic ? (
					<KeyboardCommandKeyIcon
						className={
							styles.commandIcon + ' ' + styles.staticCommandIconStatic
						}
					/>
				) : (
					<BoltIcon
						className={styles.commandIcon + ' ' + styles.dynamicCommandIcon}
					/>
				)}
				<span
					className={
						styles.command +
						(item.isStatic ? ' ' + styles.staticCommand : '') +
						' bold'
					}
				>
					{item.isStatic ? item.command : item.command.substring(1)}
				</span>{' '}
				{item.parameterHint} {item.parameters?.join(' ')}
			</div>
			<div className={styles.description}>{item.description}</div>
		</div>
	);
};

export default memo(QuickActionItem);
