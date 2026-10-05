import styled from 'styled-components';
import { PopoverContent } from '@src/components/ui/popover';

export const Content = styled(PopoverContent)`
	box-shadow: 0 4px 10px -6px rgba(0, 0, 45, 0.4);
	border-radius: 10px;
	padding: 0;
	width: 427px;
	max-width: calc(100vw - 32px);
	max-height: calc(100dvh - 32px);
	overflow-y: auto;
`;

export const EmojiPickerContainer = styled.div`
	position: relative;
`;
