import styled from 'styled-components';
import { Button } from '@src/components/ui/button';
import {
	footerPanelTransition,
	PanelTransitionStyleProps,
} from '@src/styles/panelTransitions';

// MUI's small IconButton (5px padding) around a 20px icon: a 30px circle,
// 40px on mobile where App.css gave every IconButton 10px of padding
const iconButtonAttrs = {
	variant: 'ghost',
	color: 'neutral',
	size: 'icon-sm',
} as const;

export const SendButton = styled(Button).attrs(iconButtonAttrs)`
	align-self: center;
	width: 30px;
	height: 30px;
	border-radius: 50%;

	@media only screen and (max-width: 750px) {
		width: 40px;
		height: 40px;
	}

	.MuiSvgIcon-root {
		height: 20px;
		width: 20px;
		color: var(--chat-icon-dark) !important;
	}
`;

export const DeleteButton = styled(Button).attrs(iconButtonAttrs)`
	align-self: center;
	width: 30px;
	height: 30px;
	border-radius: 50%;

	@media only screen and (max-width: 750px) {
		width: 40px;
		height: 40px;
	}

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
