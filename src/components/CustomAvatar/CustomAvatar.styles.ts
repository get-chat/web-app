import styled, { css } from 'styled-components';
import { Avatar } from '@mui/material';

export const StyledAvatar = styled(Avatar)<{ $isLight?: boolean }>`
	&& {
		${({ $isLight }) =>
			$isLight
				? css`
						color: #6e7383 !important;
				  `
				: css`
						.MuiSvgIcon-root {
							color: #fff !important;
						}
				  `}
	}
`;
