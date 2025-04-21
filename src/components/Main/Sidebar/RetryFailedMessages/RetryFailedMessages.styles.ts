import styled, { css } from 'styled-components';
import { Alert } from '@mui/material';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;

	.MuiAlert-root {
		border-radius: 0 !important;
	}
`;

export const RetryAlert = styled(Alert)<{ $sending?: boolean }>`
	${({ $sending }) =>
		$sending &&
		css`
			opacity: 0.5;
		`}
`;

export const LastAttempt = styled.div`
	font-size: 12px !important;
	margin-top: 10px;
	opacity: 0.8;
`;

export const RetryLink = styled.a`
	font-weight: bold;
`;
