import styled from 'styled-components';
import {
	footerPanelTransition,
	PanelTransitionStyleProps,
} from '@src/styles/panelTransitions';

export const Outer = styled.div.attrs({
	className: 'interactiveMessagesOuter',
})<PanelTransitionStyleProps>`
	${footerPanelTransition}
`;

export const List = styled.div.attrs({
	className: 'interactiveMessages',
})`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const Item = styled.div`
	display: flex;
	flex-direction: row;
	font-size: 14px;

	/* MUI's medium text button, left-aligned and wrapping its two lines */
	& > [data-slot='button'] {
		width: 100%;
		justify-content: flex-start;
		padding: 6px 8px;
		border-radius: 10px;
		font-weight: 600;
		line-height: 1.75;
		white-space: normal;
		text-align: left;
		color: var(--chat-icon-dark);
	}

	& .chat__message {
		margin-bottom: 0;
	}
`;

export const Alert = styled.div`
	font-size: 12px;

	& a {
		font-weight: 600;
	}
`;

export const Description = styled.div`
	font-size: 12px;
	color: var(--chat-icon);
`;
