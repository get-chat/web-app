import styled from 'styled-components';

export const SearchContainer = styled.div.attrs({
	className: 'searchBar__search',
})`
	display: flex;
	align-items: center;
	height: auto;
	padding: 10px 15px;
	/*border-bottom: 1px solid rgba(0, 0, 45, 0.03);*/
`;

export const SearchInputContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	background-color: var(--gray-light);
	width: 100%;
	height: 35px;
	border-radius: 10px;
	/*box-shadow: 0 4px 5px -6px rgba(0, 0, 45, 0.4);*/

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
