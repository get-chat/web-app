import styled from 'styled-components';
import { Dialog } from '@mui/material';

export const StyledDialog = styled(Dialog)`
	.MuiFormControl-root {
		margin-bottom: 10px;
	}

	.MuiAlert-root {
		margin: 10px 0;
	}
`;

export const FieldsContainer = styled.div`
	display: flex;
	flex-direction: column;
`;
