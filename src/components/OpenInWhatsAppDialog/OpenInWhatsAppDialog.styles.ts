import styled from 'styled-components';
import { Dialog } from '@mui/material';

export const StyledDialog = styled(Dialog)``;

export const ContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;

	& .MuiAvatar-root {
		height: 100px;
		width: 100px;
		position: fixed;
		margin-top: -10px;
		outline: 5px solid white;

		& img {
			-webkit-user-drag: none;
		}
	}
`;

export const ContentTitle = styled.div`
	font-size: 16px;
	margin: 60px 0 20px 0;
`;
