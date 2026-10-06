import React, { useEffect, useRef, useState } from 'react';
import useQuickActionsMenu from '@src/components/QuickActionsMenu/useQuickActionsMenu';
import QuickActionItem from '@src/components/QuickActionItem';
import useNavigateList from 'react-use-navigate-list';
import { useTranslation } from 'react-i18next';
import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import { isEmptyString } from '@src/helpers/Helpers';
import { ClickAwayListener } from '@src/components/ui/click-away-listener';
import { Search as SearchOutlined } from '@src/components/icons';

export type Props = {
	input: string;
	setInput: (text: string) => void;
	setVisible: (isVisible: boolean) => void;
	onProcessCommand: (text: string) => void;
	isExpired: boolean;
};

const QuickActionsMenu: React.FC<Props> = ({
	input,
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
	const resultsRef = useRef<HTMLDivElement>();

	useEffect(() => {
		// Clear message input on start
		if (input.startsWith('/')) {
			setInput('');
		}
	}, []);

	useEffect(() => {
		inputRef.current?.focus();
	}, [inputRef.current]);

	const handleItemRun = (item?: QuickActionType) => {
		if (!item) return;

		// Running it in setTimeout to avoid incorrect click outside detections
		setTimeout(() => {
			const commandString = generateCommandString(item);
			if (item.customActionCommand) {
				onProcessCommand(item.customActionCommand);
				close();
			} else if (item.runCommand) {
				onProcessCommand(commandString);
				close();
			} else {
				setCommandInput(commandString + ' ');
				inputRef.current?.focus();
			}
		}, 0);
	};

	const { activeIndex, itemProps } = useNavigateList({
		list: data,
		onSelect: handleItemRun,
		indexPath: 'id',
	});

	const handleSearchInputKeyDown = (e: React.KeyboardEvent) => {
		// Prevent cursor from moving when navigating between commands
		switch (e.code) {
			case 'ArrowUp':
			case 'ArrowDown':
				e.preventDefault();
				break;
			case 'Backspace':
				if (isEmptyString(commandInput)) {
					close();
				}
				break;
			case 'Escape':
				close();
				break;
		}
	};

	const handleSearchInputKeyUp = (e: React.KeyboardEvent) => {
		// Prevent cursor from moving when navigating between commands
		if (['ArrowUp', 'ArrowDown'].indexOf(e.code) > -1) {
			e.preventDefault();

			setTimeout(() => {
				resultsRef.current
					?.getElementsByClassName('active')[0]
					?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}, 0);
		}
	};

	return (
		<ClickAwayListener onClickAway={close}>
			<div className="absolute right-0 bottom-12.5 left-0 z-999 mx-2.5 flex flex-col overflow-hidden rounded-[10px] bg-white">
				<div className="relative flex flex-1 items-center border-b border-gray-light bg-white">
					<SearchOutlined className="pointer-events-none absolute left-0 my-auto ml-3.75 size-5!" />
					<input
						className="flex-1 border-none bg-transparent py-2.5 pr-3.75 pl-10 text-[16px] outline-none!"
						type="text"
						placeholder={t('Search quick actions')}
						value={commandInput}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setCommandInput(e.target.value)
						}
						onKeyDown={handleSearchInputKeyDown}
						onKeyUp={handleSearchInputKeyUp}
						// @ts-ignore
						ref={inputRef}
					/>
				</div>
				<div
					className="max-h-[315px] overflow-x-hidden overflow-y-auto border-none pb-1.25 outline-none!"
					// @ts-ignore
					ref={resultsRef}
					onKeyDown={(e: React.KeyboardEvent) => e.preventDefault()}
					tabIndex={0}
				>
					{data.map((item, index) => (
						<QuickActionItem
							key={index}
							item={item}
							isSelected={index === activeIndex}
							itemProps={{ ...itemProps(item) }}
						/>
					))}

					{data.length === 0 && (
						<div className="px-3.75 py-1.25 text-[14px] text-ink/50">
							{t('No results found.')}
						</div>
					)}
				</div>
			</div>
		</ClickAwayListener>
	);
};

export default QuickActionsMenu;
