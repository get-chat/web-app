import styled from 'styled-components';
import { DoneAll, Done } from '@mui/icons-material';

export const MessageContainer = styled.div`
	padding: 10px 15px;
`;

export const MessageHeader = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.45);

	h3 {
		font-size: 14px;
		color: var(--default-text-color);
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
	.MuiSvgIcon-root {
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
