import React, { useState } from 'react';
import styles from './QuickActionsMenu.module.css';
import SearchBar from '@src/components/SearchBar';
import useQuickActionsMenu from '@src/components/QuickActionsMenu/useQuickActionsMenu';
import QuickActionItem from '@src/components/QuickActionItem';
import useNavigateList from 'react-use-navigate-list';

export type Props = {
	input: string;
	setInput: (text?: string) => any;
	onProcessCommand: (text?: string) => any;
	isExpired: boolean;
};

const QuickActionsMenu: React.FC<Props> = ({
	input,
	setInput,
	onProcessCommand,
	isExpired,
}) => {
	const [commandInput, setCommandInput] = useState('');

	const { data, generateCommandString } = useQuickActionsMenu({
		input: commandInput,
		isExpired,
	});

	const { activeIndex, itemProps } = useNavigateList({
		list: data,
		onSelect: (item) => {
			console.log(item);
		},
	});

	return (
		<div className={styles.container}>
			<SearchBar isLoading={false} onChange={setCommandInput} />
			<div className={styles.results}>
				{data.map((item, index) => (
					<QuickActionItem
						{...itemProps(item)}
						key={index}
						item={item}
						generateCommandString={generateCommandString}
						setInput={setCommandInput}
						onProcessCommand={onProcessCommand}
						isSelected={index === activeIndex}
					/>
				))}
			</div>
		</div>
	);
};

export default QuickActionsMenu;
