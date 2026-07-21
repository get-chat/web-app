import styled, { css } from 'styled-components';

export const SearchContainer = styled.div.attrs({
	className: 'searchBar__search',
})`
	display: flex;
	align-items: center;
	height: auto;
	padding: 10px 15px;
	/*border-bottom: 1px solid rgba(0, 0, 45, 0.03);*/
`;

export const SearchInputContainer = styled.div.attrs({
	className: 'searchBar__inputContainer',
})<{ $isFocusStyleEnabled?: boolean }>`
	position: relative;
	display: flex;
	align-items: center;
	background-color: var(--gray-light);
	width: 100%;
	height: 35px;
	border-radius: 10px;
	transition: background-color ease-out 0.15s, box-shadow ease-out 0.15s;

	${({ $isFocusStyleEnabled = true }) =>
		$isFocusStyleEnabled &&
		css`
			&:focus-within {
				background-color: #fff;
				box-shadow: 0 0 0 1px var(--color-primary),
					0 0 0 4px rgba(101, 203, 172, 0.2);
			}
		`}

	> .MuiSvgIcon-root {
		color: var(--lighter-text-color);
	}

	> .MuiCircularProgress-root {
		padding: 10px;
	}

	> .MuiSvgIcon-root,
	> .MuiCircularProgress-root {
		position: absolute;
		left: 10px;
		margin-top: auto;
		margin-bottom: auto;
		pointer-events: none;
		width: 20px !important;
		height: 20px !important;
		padding: 0 !important;
	}
`;

export const SearchInput = styled.input`
	flex: 1;
	border: none;
	background-color: transparent;
	padding: 0 10px 0 40px;
	/*margin: 0 10px 0 calc(15px + 0.2em);*/
	font-size: 14px;

	&:focus {
		outline: none;
	}
`;
