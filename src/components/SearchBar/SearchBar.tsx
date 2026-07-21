import React, { ChangeEvent } from 'react';
import { SearchOutlined } from '@mui/icons-material';
import * as Styled from './SearchBar.styles';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type Props = {
	value: string;
	onChange?: (text: string) => void;
	isLoading?: boolean;
	placeholder?: string;
	onFocus?: () => void;
	onBlur?: () => void;
	// The focused input lifts to white with a glow; disable where the
	// search bar sits on a surface that treatment clashes with
	isFocusStyleEnabled?: boolean;
};

const SearchBar: React.FC<Props> = ({
	value,
	onChange,
	isLoading = false,
	placeholder,
	onFocus,
	onBlur,
	isFocusStyleEnabled = true,
}) => {
	const { t } = useTranslation();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange?.(event.target.value);
	};

	return (
		<Styled.SearchContainer>
			<Styled.SearchInputContainer $isFocusStyleEnabled={isFocusStyleEnabled}>
				{isLoading ? <CircularProgress /> : <SearchOutlined />}
				<Styled.SearchInput
					placeholder={placeholder ?? t('Search')}
					type="text"
					autoComplete="off"
					value={value}
					onChange={handleChange}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			</Styled.SearchInputContainer>
		</Styled.SearchContainer>
	);
};

export default SearchBar;
