import styled from 'styled-components';
import { ButtonBase, IconButton, MenuItem } from '@mui/material';

export const Container = styled(ButtonBase).attrs({
	className: 'tagsChip',
	component: 'div',
})<{ $isClickable?: boolean }>`
	background-color: rgba(0, 0, 45, 0.06) !important;
	border-radius: 10px !important;
	font-size: 12px;
	height: 19px;
	display: flex !important;
	flex-direction: row;
	align-items: center !important;
	cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};

	.MuiSvgIcon-root {
		color: var(--default-text-color) !important;
		height: 0.6em;
		width: 0.6em;
		margin: 0 3px;
	}
`;

export const Avatar = styled.div<{ iconColor?: string }>`
	height: 19px !important;
	width: 19px !important;
	font-size: 11px !important;
	margin-right: 5px;
	align-self: center;
	background-color: ${({ iconColor }) =>
		iconColor ? 'white !important' : 'inherit'};

	.MuiSvgIcon-root {
		color: ${({ iconColor }) =>
			iconColor ? iconColor : 'rgba(0, 0, 0, 0.6)'} !important;
		height: 0.5em;
		width: 0.5em;
	}
`;

export const Label = styled.span<{ $isWider?: boolean }>`
	max-width: ${({ $isWider }) => ($isWider ? '110px' : '55px')};
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	margin-left: -2px;
	margin-right: 5px;
`;

export const ActionIcon = styled(IconButton)`
	height: 19px !important;
	width: 19px !important;
	margin-left: -2px !important;
`;

export const TagMenuItem = styled(MenuItem)<{ $isSelected?: boolean }>``;

export const MenuHeader = styled.h6`
	padding: 4px 12px;
	display: flex;
	align-items: center;

	.MuiSvgIcon-root {
		height: 13px;
		width: 13px;
		margin-right: 5px;
	}
`;
