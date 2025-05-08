import styled from 'styled-components';

export const Title = styled.div`
	margin-bottom: 5px;
`;

export const List = styled.ul`
	list-style: none;
	padding: 4px;
	border-radius: 2px;
	background: #f7f6ef;
	margin: 0 0 5px;
`;

export const Item = styled.li`
	& + & {
		margin-top: 4px;
		padding-top: 4px;
		border-top: 1px solid #ebebeb;
	}
`;
