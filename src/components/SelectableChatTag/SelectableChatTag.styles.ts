import styled from 'styled-components';
import { ListItem } from '@mui/material';

export const StyledListItem = styled(ListItem)`
	padding: 0 !important;
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

	.MuiSvgIcon-root {
		margin-right: 8px;
	}
`;
