import styled from 'styled-components';
// Was MUI's ListItem
export const StyledListItem = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	width: 100%;
	padding: 0;
	text-align: left;
`;

export const TagContainer = styled.div<{ $isSelected?: boolean }>`
	display: flex;
	flex: 1;
	flex-direction: row;
	align-items: center;
	padding: 5px 15px;
	background-color: ${({ $isSelected }) =>
		$isSelected ? 'rgb(217, 239, 236) !important' : 'inherit'};
`;

export const TagContent = styled.div`
	flex: 1 1;
	display: flex;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	margin-left: 10px;
	font-weight: 600;

	.app-icon {
		margin-right: 8px;
	}
`;
