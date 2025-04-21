import styled, { css } from 'styled-components';
import Alert from '@mui/material/Alert';

export const Wrapper = styled.div<{ $isMobile?: boolean }>`
	display: flex;
	flex-direction: column;

	${({ $isMobile }) =>
		$isMobile &&
		css`
			pointer-events: none;
			position: absolute;
			z-index: 10;
			margin-left: 30%;
			margin-right: 15px;
			margin-top: 70px;
		`}
`;

export const StyledAlert = styled(Alert)<{ $isMobile?: boolean }>`
	& .MuiLinearProgress-root {
		height: 3px;
		margin-top: 10px;
	}

	${({ $isMobile }) =>
		$isMobile &&
		css`
			box-shadow: 0 6px 10px -6px rgba(0, 0, 45, 0.4);
		`}
`;
