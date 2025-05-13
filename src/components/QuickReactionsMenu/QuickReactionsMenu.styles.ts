import styled from 'styled-components';
import { Menu } from '@mui/material';

export const StyledMenu = styled(Menu)`
	& .MuiPaper-root {
		box-shadow: 0 4px 10px -6px rgba(0, 0, 45, 0.4);
		border-radius: 40px !important;
		padding: 2px 12px;
	}
`;

export const ReactionsContainer = styled.div`
	display: flex;
	gap: 10px;

	& > * {
		cursor: pointer;
		transition: all ease-out 0.2s;

		&:hover {
			transform: scale(1.2);
		}
	}
`;
