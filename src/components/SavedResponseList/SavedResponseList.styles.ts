import styled from 'styled-components';
import {
	footerPanelTransition,
	PanelTransitionStyleProps,
} from '@src/styles/panelTransitions';

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
