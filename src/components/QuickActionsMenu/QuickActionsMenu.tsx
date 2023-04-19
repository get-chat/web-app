import React, { useEffect, useRef, useState } from 'react';
import styles from './QuickActionsMenu.module.css';
import useQuickActionsMenu from '@src/components/QuickActionsMenu/useQuickActionsMenu';
import QuickActionItem from '@src/components/QuickActionItem';
import useNavigateList from 'react-use-navigate-list';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { useTranslation } from 'react-i18next';

export type Props = {
	setInput: (text?: string) => void;
	setVisible: (isVisible: boolean) => void;
	onProcessCommand: (text?: string) => void;
	isExpired: boolean;
};

const QuickActionsMenu: React.FC<Props> = ({
	setInput,
	setVisible,
	onProcessCommand,
	isExpired,
}) => {
	const { t } = useTranslation();

	const [commandInput, setCommandInput] = useState('');

	const { data, generateCommandString } = useQuickActionsMenu({
		input: commandInput,
		isExpired,
	});

	const close = () => {
		setVisible(false);
	};

	const inputRef = useRef<HTMLInputElement>();
	const containerRef = useDetectClickOutside({ onTriggered: close });

	useEffect(() => {
		// Clear message input on start
		setInput('');
	}, []);

	useEffect(() => {
		inputRef.current?.focus();
	}, [inputRef.current]);

	const { activeIndex, itemProps } = useNavigateList({
		list: data,
		onSelect: (item) => {
			console.log(item);
		},
	});

	return (
		<div className={styles.container} ref={containerRef}>
			<input
				type="text"
				placeholder={t('Search quick actions')}
				value={commandInput}
				onChange={(e) => setCommandInput(e.target.value)}
				className={styles.searchInput}
				// @ts-ignore
				ref={inputRef}
			/>
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
