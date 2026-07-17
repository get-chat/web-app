import styled, { css, keyframes } from 'styled-components';
import { Skeleton } from '@mui/material';
import { messageBubbleTail } from '@src/components/Main/Chat/ChatMessage/ChatMessage.styles';
import { PanelTransitionStyleProps } from '@src/styles/panelTransitions';

const fadeOut = keyframes`
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
`;

/* Overlays .chat__body inside .chat__body__outer without participating
in its layout, so the skeleton can never affect the body's height or
scrollbar. Transparent: the bubbles sit over .chat's own wallpaper and
dissolve away while the loaded messages fade in underneath (see
.chat__body--appearing in Chat.css). Exit pairs with
useUnmountTransition in ChatView, which keeps the overlay mounted until
animationend. */
export const Container = styled.div<PanelTransitionStyleProps>`
	position: absolute;
	inset: 0;
	/* No positive z-index on purpose: as the last positioned sibling the
	overlay already paints above .chat__body's content by paint order. A
	positive z-index would let it escape above the loading screen while
	that screen is mid-fade — MUI's <Fade> puts opacity < 1 on the loading
	screen's wrapper, which traps its own z-index in a new stacking context
	and drops it to the auto level this overlay would then outrank. */
	pointer-events: none;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	overflow: hidden;
	padding: var(--chat-body-padding);
	/* Mirror the body's border geometry (the visible border underneath
	shows through) so content boxes align exactly */
	border-left: var(--chat-body-border-left);
	border-color: transparent;
	/* Reserve the same classic-scrollbar gutter as .chat__body so the
	skeleton bubbles stay pixel-aligned with the messages beneath */
	scrollbar-gutter: stable;

	/* When the body is shorter than the pattern, clip the topmost rows
	(via the overflow above) instead of squeezing every row into view */
	& > * {
		flex-shrink: 0;
	}

	${({ $isExiting }) =>
		$isExiting &&
		css`
			animation: ${fadeOut} 0.25s ease-out forwards;
		`}

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`;

/* Mirrors .chat__message__dateContainer and the assignment/tagging event
Container rows: a centered pill, for events with a timestamp below */
export const CenteredRow = styled.div<{
	$isDate?: boolean;
}>`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 25px;

	${({ $isDate }) =>
		$isDate &&
		css`
			margin: 20px 10px 30px 10px;
		`}
`;

/* The doubled ampersands (&&) outweigh MUI's own .MuiSkeleton-rounded
border-radius, which otherwise wins the cascade against these rules */
export const Pill = styled(Skeleton).attrs({ variant: 'rounded' })`
	&& {
		border-radius: 15px;
	}
`;

/* Mirrors Timestamp of the assignment/tagging event views */
export const EventTimestamp = styled(Skeleton).attrs({ variant: 'text' })`
	margin-top: 5px;
	font-size: x-small;
`;

/* Mirrors SenderName in ChatMessage.styles.ts */
export const SenderName = styled(Skeleton).attrs({ variant: 'text' })<{
	$isOutgoing?: boolean;
}>`
	margin: 0 10px 2px;
	font-size: x-small;

	${({ $isOutgoing }) =>
		$isOutgoing &&
		css`
			align-self: flex-end;
		`}
`;

/* Mirrors ChatMessage in ChatMessage.styles.ts: radius, the grouping
overlap (-22px) and the tail on a group's first bubble */
export const Bubble = styled(Skeleton).attrs({ variant: 'rounded' })<{
	$isOutgoing?: boolean;
	$isFirstInGroup?: boolean;
}>`
	position: relative;
	margin-bottom: 25px;
	max-width: 70%;

	${({ $isOutgoing }) =>
		$isOutgoing &&
		css`
			margin-left: auto;
		`}

	&& {
		border-radius: 12px;

		${({ $isFirstInGroup }) =>
			$isFirstInGroup
				? messageBubbleTail
				: css`
						margin-top: -22px;
				  `}
	}
`;
