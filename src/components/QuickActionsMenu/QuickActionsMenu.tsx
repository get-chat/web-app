import React, { useState } from 'react';
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
	const [commandInput, setCommandInput] = useState('');

	return (
		<div className={styles.container}>
			<SearchBar isLoading={false} onChange={setCommandInput} />
			<div className={styles.results}>{commandInput}</div>
		</div>
	);
};

export default QuickActionsMenu;
