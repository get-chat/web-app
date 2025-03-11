import React, { ChangeEvent } from 'react';
import { SearchOutlined } from '@mui/icons-material';
import '../styles/SearchBar.css';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type Props = {
	value: string;
	onChange?: (text: string) => void;
	isLoading?: boolean;
	placeholder?: string;
	onFocus?: () => void;
	onBlur?: () => void;
};

const SearchBar: React.FC<Props> = ({
	value,
	onChange,
	isLoading = false,
	placeholder,
	onFocus,
	onBlur,
}) => {
	const { t } = useTranslation();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange?.(event.target.value);
	};

	return (
		<div className="searchBar__search">
			<div className="searchBar__searchContainer">
				{isLoading ? (
					<CircularProgress />
				) : (
					<SearchOutlined className="searchBar__searchContainer__searchIcon" />
				)}

				<input
					placeholder={placeholder ?? t('Search')}
					type="text"
					autoComplete="off"
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
