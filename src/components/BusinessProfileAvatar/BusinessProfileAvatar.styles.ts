import styled from 'styled-components';
import { CircularProgress } from '@mui/material';

export const Container = styled.div.attrs({
	className: 'BusinessProfileAvatarContainer',
})`
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
`;

export const StyledCircularProgress = styled(CircularProgress)`
	position: absolute;
	pointer-events: none;
`;
