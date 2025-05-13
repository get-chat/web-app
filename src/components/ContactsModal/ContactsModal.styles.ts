import styled from 'styled-components';
import { DialogTitle, DialogContent } from '@mui/material';

export const StyledDialogTitle = styled(DialogTitle)`
	&& {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
`;

export const StyledDialogContent = styled(DialogContent).attrs({
	className: 'MuiDialogContent-root noPadding',
})`
	&& {
		padding: 0 !important;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 200px;

		a {
			color: var(--color-light-blue);
		}
	}
`;

export const NoContactsContent = styled.div`
	padding: 10px 15px;
	text-align: center;
	font-weight: normal;
`;

export const EmptyTitle = styled.div`
	font-weight: normal;
	text-align: center;
	padding: 20px;
`;

export const DialogHeader = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const DialogButton = styled.div`
	margin-left: 10px;
`;
