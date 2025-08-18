import styled, { css } from 'styled-components';
import { Button } from '@mui/material';

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

export const TitleCode = styled.span`
	opacity: 0.75;
	font-weight: 400;
`;

export const Details = styled.div`
	font-size: 14px;
`;

export const RefreshContainer = styled.div`
	margin-top: 15px;
	display: flex;
	gap: 15px;
	align-items: flex-start;
`;

export const RefreshText = styled.div<{
	$highlight?: boolean;
}>`
	font-size: 12px;
	font-weight: 600;
	margin-bottom: 8px;
	padding: 4px 8px;

	${(props) =>
		props.$highlight &&
		css`
			border-radius: 10px;
			background-color: var(--red-dark);
			transition: all 0.5s ease;
		`}
`;

export const RefreshButton = styled(Button)`
	box-shadow: none !important;
	background-color: white !important;
	color: var(--red) !important;
	padding: 2px 10px !important;
	&:hover {
		box-shadow: none !important;
		background-color: rgba(255, 255, 255, 0.85) !important;
	}
`;
