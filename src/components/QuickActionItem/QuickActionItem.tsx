import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import React, { memo } from 'react';
import styles from './QuickActionItem.module.css';

export type Props = {
	item: QuickActionType;
	generateCommandString: any;
	setInput: (text: string) => any;
	onProcessCommand: (text?: string) => any;
};

const QuickActionItem: React.FC<Props> = ({
	item,
	generateCommandString,
	setInput,
	onProcessCommand,
}) => {
	return (
		<div className={styles.container}>
			<span className="bold">{item.command}</span> {item.parameterHint}{' '}
			{item.parameters?.join(' ')}
		</div>
	);
};

export default memo(QuickActionItem);
