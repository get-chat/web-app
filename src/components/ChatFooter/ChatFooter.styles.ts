import styled from 'styled-components';
import { Badge, Fab, Grow, IconButton, Tooltip, Zoom } from '@mui/material';

export const Container = styled.div`
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

export const ActionIcon = styled(IconButton)`
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

	&.expired {
		height: auto !important;
		align-items: normal;
		flex-direction: column;
		padding: 15px;
		border-left: 1px solid lightgray;

		@media only screen and (max-width: 750px) {
			border-left: none;
		}
	}

	> .MuiIconButton-root {
		padding: 10px !important;
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
	border-radius: 10px;
	margin-bottom: 5px;
	border: none;
	box-shadow: 0 4px 5px -6px rgba(0, 0, 45, 0.4);

	&:focus {
		outline: none;
		border: none;
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

	[contenteditable] {
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

export const ScrollButtonWrapper = styled(Badge)`
	position: absolute !important;
	bottom: 112px;
	right: 20px;

	.MuiBadge-anchorOriginTopLeftRectangle {
		top: 3px;
		left: 3px;
	}
`;

export const ScrollButton = styled(Fab)`
	background-color: white !important;

	.MuiSvgIcon-root {
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
export const DesktopOnly = styled.div``;
export const Hidden = styled.div``;
