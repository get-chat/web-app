import styled from 'styled-components';
import {
	footerPanelTransition,
	PanelTransitionStyleProps,
} from '@src/styles/panelTransitions';

export const Outer = styled.div.attrs({
	className: 'templateMessagesOuter',
})<PanelTransitionStyleProps>`
	${footerPanelTransition}
`;
