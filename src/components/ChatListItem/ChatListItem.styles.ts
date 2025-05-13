import styled from 'styled-components';
import DoneAll from '@mui/icons-material/DoneAll';
import WarningIcon from '@mui/icons-material/Warning';
import SellIcon from '@mui/icons-material/Sell';
import Moment from 'react-moment';
import { Checkbox, ListItemButton } from '@mui/material';

export const ListItem = styled(ListItemButton)`
	padding: 0 !important;
`;

export const Wrapper = styled.div`
	background-color: white;
	position: relative;
	flex: 1 1;
	display: flex;
	flex-direction: column;
	cursor: pointer;

	&.active {
		background-color: var(--gray-lighter);
	}

	&.selected {
		background-color: rgb(217, 239, 236) !important;
	}

	&.activeChat.selected {
		background-color: rgb(186, 217, 213) !important;
	}

	&:hover .assigneeChipWrapper.empty > .assigneeChip {
		max-width: 55px !important;
		opacity: 1;
	}

	&:hover .waId {
		opacity: 1;
	}

	&.expired .avatarWrapper .mainAvatar > img {
		filter: grayscale(100%);
	}

	&.almostExpired .timeLeft {
		background-color: #f5ba31;
	}

	@media only screen and (max-width: 750px) {
		&:hover .waId {
			display: none;
		}
	}
`;

export const Item = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex: 1 1;
	padding: 10px 15px;

	.MuiAvatar-root {
		align-self: center;
		height: 50px;
		width: 50px;
	}

	&.expired .lastMessageWrapper {
		color: rgba(0, 0, 45, 0.4);
	}
`;

export const AvatarWrapper = styled.div`
	position: relative;
`;

export const Selection = styled(Checkbox)`
	margin-left: -10px !important;
	margin-right: 5px !important;
`;

export const NameWrapper = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	gap: 5px;

	h2 {
		font-weight: 600;
		font-size: 14px;
		flex: 1;
	}

	h2 > span {
		display: -webkit-box;
		overflow: hidden;
		text-overflow: ellipsis;
		word-break: break-all;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
	}

	h2 .emoji-mart-emoji {
		height: 14px !important;
		width: 14px !important;
	}
`;

export const AssigneeChipWrapper = styled.div.attrs({
	className: 'assigneeChipWrapper',
})`
	&.empty > .assigneeChip:not(.menuOpen) {
		opacity: 0;
		transition: opacity ease-in 0.1s;
	}
`;

export const DateTagWrapper = styled.div`
	display: flex;
	flex-direction: row;
	align-items: baseline;
`;

export const LastMessageDate = styled(Moment)`
	font-weight: 400;
	font-size: 10px;
	color: rgba(0, 0, 45, 0.6);
`;

export const Tags = styled.div`
	margin-left: 7px;
	margin-right: 5px;
	display: flex;
	flex-direction: row;
	width: max-content;
`;

export const TagIcon = styled(SellIcon)`
	height: 0.7em !important;
	width: 0.7em !important;
	margin-left: -7px;
`;

export const WaId = styled.span.attrs({
	className: 'waId',
})`
	opacity: 0;
	font-size: 10px;
	color: rgba(0, 0, 45, 0.65);
	transition: opacity ease 0.1s;
	position: absolute;
	bottom: 1px;
	right: 15px;
	margin-left: 5px;
`;

export const LastMessageWrapper = styled.div`
	display: flex;
	flex-direction: row;
	align-items: baseline;
	justify-content: space-between;
	color: rgba(0, 0, 45, 0.7);
	font-size: 14px;
`;

export const LastMessage = styled.div`
	flex: 1;

	> div {
		display: -webkit-box;
		overflow: hidden;
		text-overflow: ellipsis;
		word-break: break-all;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		margin-right: 5px;
	}

	.MuiSvgIcon-root {
		color: rgba(0, 0, 45, 0.3) !important;
		height: 0.8em;
		width: 0.8em;
		margin-left: -2px;
		margin-right: 5px;
	}

	.emoji-mart-emoji {
		height: 18px !important;
		width: 18px !important;
	}

	.chatMessageTypeLabel {
		font-weight: 600;
	}
`;

export const TimeLeft = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 12px;
	font-weight: 600;
	border-radius: 10px;
	padding: 0 5px 0 0;
	height: 19px;
	background-color: var(--color-primary);
	color: white;
	transition: background-color ease-in 0.8s;
`;

export const TimeLeftIconWrapper = styled.div`
	height: 19px;
	width: 19px;
	border-radius: 15px;
	margin-right: 3px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.2);

	.MuiSvgIcon-root {
		height: 11px !important;
		width: 11px !important;
		color: #fff !important;
	}
`;

export const NewMessagesBadge = styled.div`
	position: absolute;
	bottom: -3px;
	left: 33px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	border-radius: 10px;
	padding: 1px 5px;
	font-weight: 600;
	border: 1px solid red;
	background-color: red;
	color: white;
	min-width: 18px;
`;

export const Info = styled.div`
	flex: 1;
	margin-left: 15px;
`;

export const FailedMessagesIndicator = styled.div`
	position: absolute;
	top: 3px;
	left: 8px;

	.MuiSvgIcon-root {
		height: 22px;
		width: 22px;
		color: red !important;
	}
`;

export const BlueIcon = styled(DoneAll)`
	fill: var(--color-light-blue) !important;
`;

export const ErrorIcon = styled(WarningIcon)`
	color: red !important;
`;
