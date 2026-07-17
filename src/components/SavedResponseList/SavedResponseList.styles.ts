import styled from 'styled-components';
import { IconButton } from '@mui/material';
import {
	footerPanelTransition,
	PanelTransitionStyleProps,
} from '@src/styles/panelTransitions';

export const SendButton = styled(IconButton)`
	align-self: center;

	.MuiSvgIcon-root {
		height: 20px;
		width: 20px;
		color: var(--chat-icon-dark) !important;
	}
`;

export const DeleteButton = styled(IconButton)`
	align-self: center;

	.MuiSvgIcon-root {
		height: 20px;
		width: 20px;
		color: var(--color-secondary) !important;
	}
`;

export const Outer = styled.div.attrs({
	className: 'savedResponsesOuter',
})<PanelTransitionStyleProps>`
	${footerPanelTransition}
`;

export const SearchContainer = styled.div`
	display: flex;
	flex-direction: column;

	& .MuiSvgIcon-root {
		color: var(--chat-icon) !important;
	}

	& .searchBar__inputContainer {
		background-color: transparent;

		& input::placeholder {
			color: var(--chat-icon) !important;
		}
	}
`;
