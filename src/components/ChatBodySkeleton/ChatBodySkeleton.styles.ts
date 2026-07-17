import styled, { css } from 'styled-components';
import { Skeleton } from '@mui/material';
import { messageBubbleTail } from '@src/components/Main/Chat/ChatMessage/ChatMessage.styles';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	/* If the pattern is taller than the chat body, shrink and clip at the
	top instead of overflowing, which would show a scrollbar during load */
	min-height: 0;
	overflow: hidden;
	/* The bubble tails (messageBubbleTail) stick out 6px beyond the
	bubbles; move the clipping edges outward so they are not cut off */
	margin: 0 -6px;
	padding: 0 6px;
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
