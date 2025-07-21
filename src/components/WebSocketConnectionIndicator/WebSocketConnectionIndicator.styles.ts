import styled from 'styled-components';
import { Collapse } from '@mui/material';

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	background-color: var(--red);
	color: white;
	padding: 15px 15px;
	gap: 15px;

	& > .MuiSvgIcon-root {
		height: 48px;
		width: 48px;
		color: white !important;
	}
`;

export const Title = styled.div`
	font-weight: 600;
	font-size: 16px;
`;

export const Details = styled.div`
	font-size: 14px;
`;

export const ExtraDetailsTitle = styled.div`
	font-weight: 600;
	font-size: 12px;
	margin-top: 5px;
	cursor: pointer;
`;

export const ExtraDetails = styled(Collapse)`
	font-size: 14px;
`;
