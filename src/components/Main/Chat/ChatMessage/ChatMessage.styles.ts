import styled, { css } from 'styled-components';
import { MessageType } from '@src/types/messages';
import { DoneAll } from '@mui/icons-material';

export const Reactions = styled.div`
	background-color: white;
	position: absolute;
	left: 5px;
	padding: 0 5px;
	border-radius: 12px;
	box-shadow: 0 3px 5px -6px rgba(0, 0, 45, 0.4);
	border: 1px solid var(--chat-bg);
	font-size: 15px;
	height: 23px;
	display: flex;
	gap: 5px;
	align-items: center;
	cursor: pointer;

	& > * {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		font-weight: 500;
	}
`;

export const Reaction = styled.div`
	.emoji-mart-emoji {
		height: 15px !important;
		width: 15px !important;
	}

	.printMessage > span {
		display: flex;
	}
`;

export const ReactionCount = styled.span`
	opacity: 0.5;
`;

export const Actions = styled.div<{
	$isRight?: boolean;
	$isNonText?: boolean;
	$isExpired?: boolean;
}>`
	position: absolute;
	top: 4px;
	left: ${(props) => (props.$isRight ? 'unset' : '0')};
	right: ${(props) => (props.$isRight ? '0' : 'unset')};
	opacity: 0;
	display: flex;
	gap: 5px;
	transition: all 0.5s;
	margin: 0 -10px;
	transform: ${(props) =>
		props.$isRight ? 'translate(100%, 0)' : 'translate(-100%, 0)'};
`;

export const Action = styled.div`
	cursor: pointer;
	z-index: 3;
	background-color: rgba(100, 86, 82, 0.4);
	border-radius: 35px;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 25px;
	width: 25px;
	transition: all ease-out 0.2s;

	&:hover {
		background-color: rgba(100, 86, 82, 0.65);
	}

	.MuiSvgIcon-root {
		color: white !important;
		height: 18px !important;
		width: 18px !important;
	}
`;

export const Forwarded = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.5);
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin-bottom: 5px;

	.MuiSvgIcon-root {
		color: rgba(0, 0, 45, 0.3) !important;
		transform: scale(-1, 1);
		height: 0.7em;
		width: 0.7em;
		margin-right: 5px;
	}
`;

export const SenderName = styled.div.attrs({
	className: 'chat__name',
})<{
	$isOutgoing?: boolean;
}>`
	display: block;
	margin: 0 10px 2px;
	font-size: x-small;
	font-weight: 600;
	color: rgba(0, 0, 45, 0.75);

	${({ $isOutgoing }) =>
		$isOutgoing &&
		css`
			text-align: right;
		`}

	& .emoji-mart-emoji {
		height: 12px !important;
		width: 12px !important;
		vertical-align: middle;
	}
`;

export const ChatMessageOuter = styled.div.attrs({
	className: 'chat__message__outer',
})<{
	$isOutgoing?: boolean;
	$type?: string;
}>`
	&:hover ${Actions} {
		opacity: 1;
	}
`;

export const ChatMessage = styled.div.attrs({
	className: 'chat__message',
})<{
	$type: MessageType;
	$isOutgoing?: boolean;
	$isReceived?: boolean;
	$hasMedia?: boolean;
	$hasReaction?: boolean;
	$isSenderHidden?: boolean;
	$isFirstInGroup?: boolean;
	$isFailed?: boolean;
}>`
	position: relative;
	font-size: 14px;
	padding: 5px 10px;
	border-radius: 12px;
	width: ${(props) =>
		props.$hasMedia || props.$type === MessageType.location
			? 'min-content'
			: 'fit-content'};
	background-color: #ffffff;
	margin-bottom: 25px;
	box-shadow: 0 1px 1px rgba(94, 56, 38, 0.1),
		0 2px 6px -2px rgba(94, 56, 38, 0.12);
	max-width: 70%;
	transition: opacity 1s ease;
	margin-top: ${(props) => (props.$isSenderHidden ? '-22px' : '0')};

	& a {
		color: var(--color-light-blue);
	}

	& .printMessage {
		white-space: pre-line;
	}

	& img {
		background-color: rgba(0, 0, 45, 0.1);
	}

	${(props) =>
		[MessageType.template, MessageType.interactive].includes(props.$type) &&
		css`
			background-color: #f4f0d7 !important;
		`}

	${({ $hasReaction }) =>
		$hasReaction &&
		css`
			margin-bottom: 42px;
		`}

	${({ $isOutgoing }) =>
		$isOutgoing &&
		css`
			margin-left: auto;
			background-color: #dcf8c6;

			& .chat__message__info {
				cursor: pointer;
			}
		`}

	// The first message of each sender group carries a small tail pointing
	// to the sender's side; the tail inherits the background so it matches
	// every bubble color
	${({ $isFirstInGroup, $isOutgoing }) =>
		$isFirstInGroup &&
		css`
			${$isOutgoing ? 'border-top-right-radius' : 'border-top-left-radius'}: 0;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				${$isOutgoing ? 'right' : 'left'}: -6px;
				width: 6px;
				height: 10px;
				background: inherit;
				/* Straight-edged fallback for browsers without path() support */
				clip-path: ${$isOutgoing
					? 'polygon(0 0, 100% 0, 0 100%)'
					: 'polygon(0 0, 100% 0, 100% 100%)'};
				/* A soft sweep with a rounded tip, leaving the bubble edge
				tangentially so the junction stays smooth */
				clip-path: ${$isOutgoing
					? "path('M0 0 L0 10 C0 8 1.4 5.6 5.4 2.6 Q6 1 4.4 0 Z')"
					: "path('M6 0 L6 10 C6 8 4.6 5.6 0.6 2.6 Q0 1 1.6 0 Z')"};
			}
		`}

	${({ $isReceived }) =>
		$isReceived &&
		css`
			& ${DoneAllIcon} {
				fill: var(--color-light-blue);
			}
		`}
`;

export const DoneAllIcon = styled(DoneAll)`
	fill: #8990b4;
	/* Softens the color change from delivered to read */
	transition: fill 0.3s ease;
`;
