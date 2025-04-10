import styled from 'styled-components';
import { ListItem } from '@mui/material';

export const SearchMessageContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex: 0.4 1;
	border-left: 1px solid lightgray;

	@media only screen and (max-width: 750px) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		border-left: none;
	}
`;

export const Header = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	padding: 4px 15px;
	background-color: var(--gray-light);

	> h3 {
		margin-left: 15px;
		font-weight: 400;
		font-size: 16px;
	}

	@media only screen and (max-width: 750px) {
		padding: 4px 10px;
	}
`;

export const Body = styled.div`
	background-color: white;
	flex: 1 1;
	position: relative;
	display: flex;
	flex-direction: column;
	overflow-y: auto;

	.MuiListItem-root {
		padding: 0;
	}
`;

export const MessageResult = styled.div`
	flex: 1 1;
	cursor: pointer;
	padding: 10px 15px;
`;
