import styled from 'styled-components';
import { Button, Collapse } from '@mui/material';

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
	color: rgba(255, 255, 255, 0.8);
	-webkit-user-select: none;
`;

export const ExtraDetails = styled(Collapse)`
	font-size: 12px;
`;

export const RefreshContainer = styled.div`
	margin-top: 15px;
`;

export const RefreshText = styled.div`
	font-size: 12px;
	font-weight: 600;
	margin-bottom: 8px;
`;

export const RefreshButton = styled(Button)({
	boxShadow: 'none !important',
	backgroundColor: '#ffffff !important',
	borderColor: '#ffffff !important',
	color: 'var(--red) !important',
	'&:hover': {
		boxShadow: 'none !important',
		backgroundColor: 'rgba(255, 255, 255, 0.85) !important',
	},
});
