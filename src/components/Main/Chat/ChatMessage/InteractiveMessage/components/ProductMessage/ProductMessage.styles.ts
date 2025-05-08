import styled from 'styled-components';

export const Actions = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 5px;
	padding-bottom: 5px;
	margin-bottom: 5px;
	border-bottom: 1px solid #ccc;
`;

export const Header = styled.div`
	font-weight: normal;
`;

export const Body = styled.div`
	font-weight: normal;
`;

export const Footer = styled.div`
	opacity: 0.5;
`;

export const List = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0;

	& > li + li {
		margin-top: 5px;
	}
`;

export const Item = styled.li`
	& + & {
		margin-top: 5px;
	}
`;
