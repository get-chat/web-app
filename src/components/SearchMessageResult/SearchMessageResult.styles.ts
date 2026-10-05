import styled from 'styled-components';
import { DoneAll, Check as Done } from '@src/components/icons';

// Was MUI's clickable ListItem, which the result lists rendered without padding
export const Result = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	position: relative;
	width: 100%;
	text-align: left;
	font-size: 14px;
	cursor: pointer;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	outline: 0;
	transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		background-color: rgba(0, 0, 0, 0.04);
	}

	&:focus-visible {
		background-color: rgba(0, 0, 0, 0.12);
	}
`;

export const MessageContainer = styled.div`
	padding: 10px 15px;
`;

export const MessageHeader = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.45);

	/* The sender's name, shown in the sidebar's search results */
	h3 {
		font-size: 14px;
		font-weight: 400;
		color: var(--color-primary);
		padding: 10px 15px;
		margin-top: 5px;
		margin-bottom: 2px;
	}
`;

export const MessageBody = styled.div`
	font-size: 14px;
	color: rgba(0, 0, 45, 0.6);
	word-break: break-all;
`;

export const MessageTypeContainer = styled.span`
	.app-icon {
		margin-right: 5px;
		margin-left: 0 !important;
		width: 0.75em;
		height: 0.75em;
	}
`;

export const ReceivedStatus = styled.span`
	&.chat__received {
		.chat__iconDoneAll * {
			fill: var(--color-light-blue);
		}
	}
`;

export const StyledDoneAll = styled(DoneAll)``;
export const StyledDone = styled(Done)``;
