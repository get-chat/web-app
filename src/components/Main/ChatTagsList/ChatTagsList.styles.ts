import styled from 'styled-components';
import { DialogContent } from '@src/components/ui/dialog';

export const DialogWrapper = styled(DialogContent)`
	[data-slot='item'] {
		border-radius: 10px;
		margin-top: 5px;
	}
`;

export const LoadingOverlay = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
`;

export const TagItem = styled.div`
	margin: 0 -10px;
	font-size: 16px;
	font-weight: 600;
	display: flex;
	align-items: center;

	.app-icon {
		margin-right: 10px;
	}
`;

export const EmptyState = styled.div`
	font-size: 15px;
	color: rgba(0, 0, 45, 0.6);
`;

export const ManageTagsLink = styled.div`
	margin-top: 12px;
`;

export const DialogContentWrapper = styled.div`
	margin-bottom: 12px;
`;
