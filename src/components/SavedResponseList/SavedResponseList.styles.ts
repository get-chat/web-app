import styled from 'styled-components';

export const SearchContainer = styled.div`
	display: flex;
	flex-direction: column;

	& .MuiSvgIcon-root {
		color: var(--chat-icon) !important;
	}

	& .searchBar__inputContainer {
		background-color: transparent;

		& input::placeholder {
			color: var(--chat-icon) !important;
		}
	}
`;
