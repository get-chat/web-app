import styled from 'styled-components';
import {
	overlayPanelTransition,
	PanelTransitionStyleProps,
} from '@src/styles/panelTransitions';

// A clickable list row, like MUI's ListItem button it replaces
export const StyledListItem = styled.button`
	display: flex;
	align-items: center;
	position: relative;
	width: 100%;
	padding: 0;
	border: 0;
	background: transparent;
	font: inherit;
	/* App.css gave every MUI ListItem 14px */
	font-size: 14px;
	color: inherit;
	text-align: left;
	cursor: pointer;
	transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);

	&:focus-visible {
		outline: none;
		background-color: var(--color-primary-transparent-darker);
	}
`;

export const ContactsContainer = styled.div<PanelTransitionStyleProps>`
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
	z-index: 10;

	${overlayPanelTransition}
`;

export const ContactsHeader = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	font-size: 18px;
	padding: 4px 15px;
	background-color: var(--color-primary);
	color: white;

	h3 {
		margin-left: 15px;
		font-weight: 400;
		font-size: 18px;
	}

	.MuiSvgIcon-root {
		color: white !important;
	}
`;

export const StartByPhoneNumberWrapper = styled.div`
	background-color: white;
`;

export const StartByPhoneNumber = styled.div`
	background-color: var(--color-primary-transparent);
	color: var(--color-primary);

	${StyledListItem} {
		padding: 0;

		&:hover {
			background-color: var(--color-primary-transparent-darker);
		}
	}
`;

export const StartByPhoneNumberInner = styled.div`
	flex: 1;
	padding: 20px 15px;

	.MuiSvgIcon-root {
		height: 0.8em;
		width: 0.8em;
		color: var(--color-primary) !important;
		margin-right: 10px;
	}
`;

export const FormWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 10px 15px;
`;
