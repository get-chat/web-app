import React, { ChangeEvent } from 'react';
import { Search as SearchOutlined } from '@src/components/icons';
import * as Styled from './SearchBar.styles';
import { Spinner } from '@src/components/ui/spinner';
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
};

const SearchBar: React.FC<Props> = ({
	value,
	onChange,
	isLoading = false,
	placeholder,
	onFocus,
	onBlur,
	autoFocus,
	isFocusStyleEnabled = true,
}) => {
	const { t } = useTranslation();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange?.(event.target.value);
	};

	return (
		<Styled.SearchContainer>
			<Styled.SearchInputContainer $isFocusStyleEnabled={isFocusStyleEnabled}>
				{isLoading ? <Spinner className="text-primary" /> : <SearchOutlined />}
				<Styled.SearchInput
					placeholder={placeholder ?? t('Search')}
					type="text"
					autoComplete="off"
					autoFocus={autoFocus}
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
