import styled, { css } from 'styled-components';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar } from '@src/components/ui/avatar';

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

// MUI Avatar's fallback person icon: 75% of the avatar
export const FallbackIcon = styled(PersonIcon)`
	&& {
		width: 75%;
		height: 75%;
	}
`;
