import styled from 'styled-components';
import { Avatar } from '@mui/material';

export const StyledAvatar = styled(Avatar)<{ $isLight?: boolean }>`
	&& {
		${({ $isLight }) =>
			$isLight
				? `
            color: #6e7383 !important;
        `
				: `
            .MuiSvgIcon-root {
                color: #fff !important;
            }
        `}
	}
`;
