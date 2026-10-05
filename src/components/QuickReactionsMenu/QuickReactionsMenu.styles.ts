import styled from 'styled-components';
import { PopoverContent } from '@src/components/ui/popover';

// The vertical padding includes the 8px of the list MUI's Menu put inside
export const Content = styled(PopoverContent)`
	width: auto;
	max-width: calc(100vw - 32px);
	box-shadow: 0 4px 10px -6px rgba(0, 0, 45, 0.4);
	border-radius: 40px;
	padding: 10px 12px;
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
