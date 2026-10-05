import styled from 'styled-components';
import { Button } from '@src/components/ui/button';

export const Container = styled.div.attrs({
	className: 'container chatFooterGlobal',
})`
	position: relative;
	border-left: 1px solid lightgray;
	display: flex;
	flex-direction: column;

	@media only screen and (max-width: 750px) {
		border-left: none;
	}
`;

export const Row = styled.div`
	flex: 1;
`;

export const ActionsRow = styled.div`
	display: flex;
	flex-direction: row;
	padding: 5px 10px 10px 10px;
	gap: 7px;
`;

export const ActionsRowLeft = styled.div`
	display: flex;
	flex-direction: row;
	gap: 7px;
	align-items: center;
`;

export const ActionsRowRight = styled.div`
	flex: 1;
	justify-content: flex-end;
	display: flex;
	flex-direction: row;
	gap: 7px;
	align-items: center;
`;

export const ActionSeparator = styled.div`
	width: 1px;
	height: 20px;
	background-color: rgba(0, 0, 0, 0.1);
	margin: 0 5px;
`;

// MUI's small IconButton (5px padding) around a 20px icon: a 30px circle
export const ActionIcon = styled(Button).attrs({
	variant: 'ghost',
	color: 'neutral',
	size: 'icon-sm',
} as const)`
	width: 30px;
	height: 30px;
	border-radius: 50%;
	transition: all ease-in 0.2s;

	&.active {
		box-shadow: 0 4px 5px -6px rgba(0, 0, 45, 0.4);
		background-color: #fff !important;
		transition: all ease-in 0.2s;
	}

	.MuiSvgIcon-root {
		height: 20px;
		width: 20px;
		color: var(--chat-icon) !important;
		transition: color ease-in 0.2s;
	}

	&.active .MuiSvgIcon-root {
		color: var(--chat-icon-dark) !important;
	}
`;

export const Footer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 10px;
	max-height: 400px;
	transition: all ease-out 0.5s;

	&.expired {
		height: auto !important;
		align-items: normal;
		flex-direction: column;
	}

	> form {
		flex: 1;
		display: flex;
	}
`;

export const EmojiPickerContainer = styled.div`
	flex: 1;
	background-color: #fff;
	border-radius: 10px;
	margin: 10px;
`;

export const TypeBox = styled.div`
	overflow: hidden;
	position: relative;
	background-color: white;
	height: auto;
	flex: 1;
	border-radius: 12px;
	margin-bottom: 5px;
	border: none;
	box-shadow: var(--shadow-sm), 0 0 0 1px rgba(94, 56, 38, 0.06);
	transition: box-shadow ease-out 0.2s, background-color ease-out 0.2s;

	&:focus {
		outline: none;
		border: none;
	}

	&:focus-within {
		box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-primary),
			0 0 0 4px rgba(101, 203, 172, 0.2);
	}

	&.expired {
		background-color: #f2edea;
		box-shadow: none;
	}
`;

export const TypeBoxEditable = styled.div`
	position: relative;
	z-index: 100;
	width: 100%;
	min-height: 26px;
	max-height: 250px;
	overflow-y: auto;
	word-break: break-word;
	padding: 8px 15px;

	@media only screen and (max-width: 750px) {
		max-height: 160px;
	}

	&[contenteditable] {
		outline: 1px solid transparent;
	}
`;

export const TypeBoxHint = styled.div`
	position: absolute;
	z-index: 0;
	color: #9c8173;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
	padding: 8px 15px;
	padding-right: 25px;

	.expired & {
		color: #736054;
	}
`;

export const AttachmentContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 5px;
	border-radius: 20px;

	&.open {
		background-color: rgba(0, 0, 0, 0.05);
	}
`;

export const AttachmentOptions = styled.div`
	display: flex;
	flex-direction: row;
	gap: 7px;
	margin-left: 5px;

	@media only screen and (max-width: 750px) {
		margin-left: 0;
	}
`;

// Holds the scroll button and its unread count badge, as MUI's Badge did
export const ScrollButtonWrapper = styled.span`
	position: absolute;
	display: inline-flex;
	bottom: 112px;
	right: 20px;
	/* MUI's Fab layer, so the button floats over the messages */
	z-index: 1050;
`;

// MUI's small Fab: a raised round 40px button
export const ScrollButton = styled(Button).attrs({
	variant: 'ghost',
	color: 'neutral',
	size: 'icon-lg',
} as const)`
	border-radius: 50%;
	background-color: white !important;
	box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
		0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);

	.MuiSvgIcon-root {
		width: 24px;
		height: 24px;
		color: var(--color-primary-light) !important;
	}
`;

export const ExpiredWarning = styled.div`
	font-size: 14px;
	color: var(--lighter-text-color);
`;

export const CommandActionIcon = styled(ActionIcon)``;
export const AttachmentOptionImageAndVideo = styled(ActionIcon)``;
export const AttachmentOptionDocument = styled(ActionIcon)``;
