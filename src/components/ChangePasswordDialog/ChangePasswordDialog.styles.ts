import styled from 'styled-components';
import { DialogContent } from '@src/components/ui/dialog';

export const StyledDialogContent = styled(DialogContent)`
	[data-slot='field'] {
		margin-bottom: 10px;
	}

	[data-slot='alert'] {
		margin: 10px 0;
	}
`;

export const FieldsContainer = styled.div`
	display: flex;
	flex-direction: column;
`;
