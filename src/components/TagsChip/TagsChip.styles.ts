import styled from 'styled-components';
import { ButtonBase } from '@mui/material';

export const Container = styled(ButtonBase).attrs({
	className: 'tagsChip',
	component: 'div',
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
