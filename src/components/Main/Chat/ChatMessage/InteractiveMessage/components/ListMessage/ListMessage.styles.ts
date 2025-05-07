import styled from 'styled-components';

export const Message = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
`;

export const Actions = styled.div`
	display: flex;
	flex-direction: column;
`;

export const Header = styled.div`
	font-weight: 600;
`;

export const Body = styled.div`
	font-weight: normal;
`;

export const Footer = styled.div`
	opacity: 0.5;
	margin-bottom: 5px;
`;

export const List = styled.ul`
	display: flex;
	flex-direction: column;
	list-style: none;
	margin: 0;
	padding: 0;
	width: 100%;
	gap: 5px;
`;

export const Title = styled.h3`
	font-size: 1em;
	border-bottom: 1px solid #ccc;
	margin: 0;
`;

export const Description = styled.p`
	opacity: 0.5;
	font-size: 0.8em;
	margin: 0;
`;
