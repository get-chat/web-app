import styled from 'styled-components';
import { Spinner } from '@src/components/ui/spinner';

export const Container = styled.div.attrs({
	className: 'BusinessProfileAvatarContainer',
})`
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
`;

export const StyledSpinner = styled(Spinner)`
	position: absolute;
	pointer-events: none;
`;
