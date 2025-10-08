import styled from 'styled-components';

export const SearchContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	padding: 15px;

	& > input {
		background-color: rgba(0, 0, 0, 0.05);
		border-radius: 10px;
		min-width: 50%;
		outline: none;
		border: none;
		padding: 5px 10px;
	}
`;
