import React, { useState } from 'react';
import styles from './QuickActionsMenu.module.css';
import SearchBar from '@src/components/SearchBar';
import useQuickActionsMenu from '@src/components/QuickActionsMenu/useQuickActionsMenu';

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

	return (
		<div className={styles.container}>
			<SearchBar isLoading={false} onChange={setCommandInput} />
			<div className={styles.results}>{JSON.stringify(data)}</div>
		</div>
	);
};

export default QuickActionsMenu;
