import React from 'react';
import { SearchOutlined } from '@material-ui/icons';
import '../styles/SearchBar.css';
import { CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

function SearchBar(props) {
	const { t } = useTranslation();

	const handleChange = (event) => {
		props.onChange(event.target.value);
	};

	return (
		<div className="searchBar__search">
			<div className="searchBar__searchContainer">
				{props.isLoading === true ? (
					<CircularProgress />
				) : (
					<SearchOutlined className="searchBar__searchContainer__searchIcon" />
				)}

				<input
					placeholder={props.placeholder ?? t('Search')}
					type="text"
					onChange={handleChange}
				/>
			</div>
		</div>
	);
}

export default SearchBar;
