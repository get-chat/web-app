import styled from 'styled-components';

export const ListWrapper = styled.div`
	border-radius: 10px;
	overflow: hidden;
`;

export const List = styled.div`
	background-color: var(--gray-lighter);
	height: 300px;
	max-height: 100%;
	overflow-y: auto;
`;

export const Current = styled.div`
	font-size: 12px;
	color: var(--color-primary) !important;
`;
