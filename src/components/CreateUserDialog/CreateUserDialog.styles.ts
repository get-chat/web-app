import styled from 'styled-components';
import { Dialog } from '@mui/material';

export const StyledDialog = styled(Dialog)`
	.MuiAlert-root {
		margin-top: 10px;
	}
`;

export const FieldsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const FieldsRow = styled.div`
	display: flex;
	gap: 15px;

	@media only screen and (max-width: 600px) {
		flex-direction: column;
	}
`;

export const SectionLabel = styled.div`
	color: var(--lighter-text-color);
	font-size: 13px;
	font-weight: 500;
	margin-top: 5px;
`;

export const ActivationLinkContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 5px;
	margin-top: 8px;
	padding: 5px 5px 5px 12px;
	border-radius: 8px;
	background-color: var(--gray-lighter);
`;

export const ActivationLink = styled.div`
	flex: 1;
	font-size: 13px;
	word-break: break-all;
	color: var(--default-text-color);
`;
