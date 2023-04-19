import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import React, { memo } from 'react';
import styles from './QuickActionItem.module.css';

export type Props = {
	item: QuickActionType;
	generateCommandString: any;
	setInput: (text: string) => any;
	onProcessCommand: (text?: string) => any;
	isSelected: boolean;
};

const QuickActionItem: React.FC<Props> = ({
	item,
	generateCommandString,
	setInput,
	onProcessCommand,
	isSelected,
}) => {
	const handleClick = () => {
		// Running it in setTimeout to avoid incorrect click outside detections
		setTimeout(() => {
			const commandString = generateCommandString(item);
			if (item.runCommand) {
				onProcessCommand(commandString);
				setInput('');
			} else {
				setInput(commandString + ' ');
			}
		}, 1);
	};

	return (
		<div
			className={
				styles.container + ' ' + (isSelected ? styles.containerSelected : '')
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
