import styled, { css } from 'styled-components';
import { MessageType } from '@src/types/messages';

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
	margin: 0 10px;
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
	$isFailed?: boolean;
}>`
	position: relative;
	font-size: 14px;
	padding: 5px 10px;
	border-radius: 10px;
	width: ${(props) =>
		props.$hasMedia || props.$type === MessageType.location
			? 'min-content'
			: 'fit-content'};
	background-color: #ffffff;
	margin-bottom: 25px;
	box-shadow: 0 5px 3px -6px rgba(0, 0, 45, 0.4);
	max-width: 70%;
	transition: opacity 1s ease;
	margin-top: ${(props) => (props.$isSenderHidden ? '-20px' : '0')};

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
`;
