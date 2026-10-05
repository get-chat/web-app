import React, { ChangeEvent } from 'react';
import { Search as SearchOutlined } from '@src/components/icons';
import { Spinner } from '@src/components/ui/spinner';
import { cn } from '@src/lib/utils';
import { useTranslation } from 'react-i18next';

export type Props = {
	value: string;
	onChange?: (text: string) => void;
	isLoading?: boolean;
	placeholder?: string;
	onFocus?: () => void;
	onBlur?: () => void;
	autoFocus?: boolean;
	// The focused input lifts to white with a glow; disable where the
	// search bar sits on a surface that treatment clashes with
	isFocusStyleEnabled?: boolean;
	className?: string;
};

// The leading search icon or spinner, laid over the input's left padding
const leadingIconClass = 'pointer-events-none absolute left-2.5 size-5! p-0!';

const SearchBar: React.FC<Props> = ({
	value,
	onChange,
	isLoading = false,
	placeholder,
	onFocus,
	onBlur,
	autoFocus,
	isFocusStyleEnabled = true,
	className,
}) => {
	const { t } = useTranslation();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange?.(event.target.value);
	};

	return (
		// searchBar__search and searchBar__inputContainer are hooks that some
		// parents still style
		<div
			className={cn(
				'searchBar__search flex items-center px-3.75 py-2.5',
				className
			)}
		>
			<div
				className={cn(
					'searchBar__inputContainer relative flex h-8.75 w-full items-center rounded-[10px] bg-gray-light transition-[background-color,box-shadow] duration-150 ease-out',
					isFocusStyleEnabled &&
						'focus-within:bg-white focus-within:shadow-[0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(101,203,172,0.2)]'
				)}
			>
				{isLoading ? (
					<Spinner className={cn(leadingIconClass, 'text-primary')} />
				) : (
					<SearchOutlined className={leadingIconClass} />
				)}
				<input
					className="flex-1 border-none bg-transparent py-0 pr-2.5 pl-10 text-[14px] outline-none!"
					placeholder={placeholder ?? t('Search')}
					type="text"
					autoComplete="off"
					autoFocus={autoFocus}
					value={value}
					onChange={handleChange}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			</div>
		</div>
	);
};

export default SearchBar;
