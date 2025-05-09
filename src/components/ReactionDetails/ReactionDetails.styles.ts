import styled from 'styled-components';
import { Menu } from '@mui/material';

export const StyledMenu = styled(Menu)`
	& .MuiPaper-root {
		box-shadow: 0 4px 10px -6px rgba(0, 0, 45, 0.4);
		border-radius: 10px !important;
		padding: 5px 10px;
	}
`;

export const ReactionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-width: 100%;
	min-width: 150px;
`;

export const ReactionItem = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
`;

export const SenderName = styled.div`
	font-size: 12px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const Timestamp = styled.div`
	color: rgba(0, 0, 45, 0.6);
	font-size: x-small;
	margin-bottom: 5px;
`;
