import React from 'react';
import styles from './QuickActionsMenu.module.css';
import SearchBar from '@src/components/SearchBar';

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
	return (
		<div className={styles.container}>
			<SearchBar
				isLoading={false}
				onChange={(text: string) => console.log(text)}
			/>
			<div className={styles.results}>{input}</div>
		</div>
	);
};

export default QuickActionsMenu;
