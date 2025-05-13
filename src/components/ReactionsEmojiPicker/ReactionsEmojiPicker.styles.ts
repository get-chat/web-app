import styled from 'styled-components';
import { Menu } from '@mui/material';

export const StyledMenu = styled(Menu)`
	& .MuiPaper-root {
		box-shadow: 0 4px 10px -6px rgba(0, 0, 45, 0.4);
		border-radius: 10px !important;
		width: 427px;
		max-width: 100%;
		max-height: 100%;
	}

	& .MuiList-root {
		padding: 0;
	}
`;

export const EmojiPickerContainer = styled.div`
	position: relative;
`;
