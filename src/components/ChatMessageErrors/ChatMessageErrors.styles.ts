import styled from 'styled-components';
import { Button } from '@mui/material';

export const Container = styled.div`
	border: 1px solid var(--red-dark);
	background-color: #ffeeee;
	border-radius: 10px;
	padding: 10px;

	a {
		text-decoration: underline;
		font-weight: 600;
	}
`;

export const Recommendation = styled.div`
	color: var(--red-dark);
	margin-bottom: 6px;

	a {
		color: var(--red-dark);
	}
`;

export const Error = styled.div`
	a {
		color: inherit;
	}
`;

export const ErrorTitle = styled.div`
	font-size: 13px;
`;

export const ErrorDetails = styled.div`
	font-size: 12px;
`;

export const ErrorLink = styled.div`
	font-size: 13px;
`;

export const Code = styled.span`
	font-weight: 300 !important;
`;

export const RetryButton = styled(Button)`
	margin-top: 10px !important;
`;
