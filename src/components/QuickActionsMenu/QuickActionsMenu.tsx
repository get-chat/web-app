import React from 'react';

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
	return <div>{input}</div>;
};

export default QuickActionsMenu;
