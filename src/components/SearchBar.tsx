// @ts-nocheck
import React from 'react';
import { SearchOutlined } from '@mui/icons-material';
import '../styles/SearchBar.css';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type Props = {
	value: string;
	onChange?: (text) => void;
	isLoading: boolean;
	placeholder?: string;
};

const SearchBar: React.FC<Props> = ({
	value,
	onChange,
	isLoading,
	placeholder,
}) => {
	const { t } = useTranslation();

	const handleChange = (event) => {
		onChange(event.target.value);
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
					value={value}
					onChange={handleChange}
				/>
			</div>
		</div>
	);
};

export default SearchBar;
