import styled, { css } from 'styled-components';
import { IconButton } from '@mui/material';
import CustomAvatar from '@src/components/CustomAvatar';

export const Header = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	padding: 0 15px;
	background-color: #6843301f;
	border-left: 1px solid lightgray;

	&
		.MuiSvgIcon-root:not(.MuiAvatar-root *):not(
			.MuiAlert-root .MuiSvgIcon-root
		):not(.MuiRadio-root .MuiSvgIcon-root):not(
			.MuiCheckbox-root .MuiSvgIcon-root
		):not(.MuiButton-root .MuiSvgIcon-root):not(.MuiStepIcon-root) {
		color: var(--chat-icon);
	}

	@media only screen and (max-width: 750px) {
		padding: 4px 10px;
		border-left: none;
		box-shadow: 0 4px 5px -6px rgba(0, 0, 45, 0.4);
		z-index: 1;
	}
`;

export const MobileOnly = styled.div`
	@media only screen and (min-width: 501px) {
		display: none;
	}
`;

export const BackButton = styled(IconButton)`
	margin-right: 5px !important;
`;

export const Clickable = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	cursor: pointer;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const Avatar = styled(CustomAvatar)<{
	$isExpired?: boolean;
}>`
	${({ $isExpired }) =>
		$isExpired &&
		css`
			img {
				filter: grayscale(100%);
			}
		`}
`;

export const HeaderInfo = styled.div`
	padding-left: 15px;

	> h3 {
		color: var(--chat-icon-dark);
		font-size: 16px;
		margin-bottom: 0;
	}

	> h3 .emoji-mart-emoji {
		height: 16px !important;
		width: 16px !important;
	}

	> p {
		margin-bottom: 0;
		color: var(--chat-icon);
	}
`;

export const SubRow = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
	margin-top: -1px;
`;

export const WaId = styled.span<{ $desktopOnly?: boolean }>`
	font-size: 12px;
	color: var(--chat-icon);
	${({ $desktopOnly }) =>
		$desktopOnly &&
		`
		@media only screen and (max-width: 500px) {
			display: none;
		}
	`}
`;

export const ExpiredIndicator = styled.span`
	font-size: 12px;
	color: #fff !important;
	background-color: var(--chat-icon);
	border-radius: 10px;
	padding: 0 5px;
`;

export const ResolvedIndicator = styled.span`
	font-size: 12px;
	color: #2e7d33 !important;
	background-color: #c9e4cb;
	border-radius: 10px;
	padding: 0 5px;
`;

export const HeaderRight = styled.div`
	display: flex;
	justify-content: space-between;
`;

export const AssigneeActions = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	margin-right: 5px;
	gap: 10px;

	.assigneeChip,
	.tagsChip {
		background-color: var(--chat-bg) !important;
	}

	@media only screen and (max-width: 500px) {
		display: none;
	}
`;
