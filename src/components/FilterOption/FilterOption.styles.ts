import styled from 'styled-components';
import { ButtonBase, IconButton } from '@mui/material';

export const Container = styled(ButtonBase)<{ $isActive?: boolean }>`
	&& {
		background-color: ${({ $isActive }) =>
			$isActive ? 'var(--color-primary) !important' : 'white !important'};
		border-radius: 10px !important;
		font-size: 12px;
		height: 19px;
		display: inline-flex !important;
		flex-direction: row;
		align-items: center !important;
		vertical-align: top !important;
		padding: 0 0 0 5px !important;
		margin-right: 5px !important;
		color: ${({ $isActive }) => ($isActive ? 'white' : 'inherit')};

		.MuiSvgIcon-root {
			height: 12px !important;
			width: 12px !important;
			color: ${({ $isActive }) => ($isActive ? 'white !important' : 'inherit')};
		}
	}
`;

export const Label = styled.div`
	margin: 0 5px;
`;

export const ActionIcon = styled(IconButton)`
	&& {
		height: 19px !important;
		width: 19px !important;
		margin-left: -2px !important;

		.MuiSvgIcon-root {
			color: white !important;
		}
	}
`;
