import styled from 'styled-components';
import { ButtonBase, IconButton, Menu } from '@mui/material';

export const Container = styled(ButtonBase).attrs({
	className: 'assigneeChip',
})<{ $isClickable?: boolean }>`
	background-color: var(--gray-light) !important;
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

export const Name = styled.span<{ $isWider?: boolean }>`
	max-width: ${({ $isWider }) => ($isWider ? '110px' : '55px')};
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	margin-left: -2px;
	margin-right: 5px;
`;

export const Avatar = styled.div<{ unassigned?: boolean }>`
	height: 19px !important;
	width: 19px !important;
	font-size: 11px !important;
	margin-right: 5px;
	align-self: center;
	background-color: ${({ unassigned }) =>
		unassigned ? 'rgba(0, 0, 0, 0.05) !important' : 'inherit'};

	.MuiSvgIcon-root {
		color: ${({ unassigned }) =>
			unassigned ? 'rgba(0, 0, 0, 0.6) !important' : 'white !important'};
		height: 0.5em;
		width: 0.5em;
	}
`;

export const ActionIcon = styled(IconButton)`
	height: 19px !important;
	width: 19px !important;
	margin-left: -2px !important;
`;

export const StyledMenu = styled(Menu)`
	.MuiListItemIcon-root {
		min-width: 29px !important;
	}
`;

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

export const MenuItemWrapper = styled.div<{ isDefault?: boolean }>`
	&& {
		padding: 0 12px !important;
		font-weight: ${({ isDefault }) => (isDefault ? 'normal' : 600)};

		&.menuItemDefault {
			padding-left: 41px !important;
		}

		.MuiSvgIcon-root {
			color: var(--color-primary) !important;
		}
	}
`;
