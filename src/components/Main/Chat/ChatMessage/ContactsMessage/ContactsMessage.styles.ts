import styled from 'styled-components';
import ChatIcon from '@mui/icons-material/Chat';
import CustomAvatar from '@src/components/CustomAvatar';

export const Root = styled.div`
	position: relative;
	min-width: 180px;
`;

export const Header = styled.div`
	display: flex;
	align-items: center;
	padding: 5px 0;
`;

export const Footer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	margin: 5px 0;
`;

export const Item = styled.div`
	& + & {
		margin-top: 5px;
	}
`;

export const Avatar = styled(CustomAvatar)`
	height: 35px !important;
	width: 35px !important;
	margin-right: 10px;
`;

export const Name = styled.div`
	font-weight: 600;
`;

// Was MUI's ButtonBase: a bare button
export const MessageButton = styled.button.attrs({ type: 'button' })`
	flex: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	position: relative;
	border: 0;
	border-radius: 4px;
	margin: 0 0 5px;
	padding: 3px 5px;
	background: transparent;
	font: inherit;
	color: inherit;
	text-align: inherit;
	cursor: pointer;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	outline: 0;
	transition: background-color 150ms;

	&:hover {
		background-color: rgba(0, 0, 45, 0.04);
	}

	&:focus-visible {
		box-shadow: 0 0 0 3px rgba(101, 203, 172, 0.3);
	}
`;

export const MessageButtonIcon = styled(ChatIcon)`
	color: var(--color-primary) !important;
	height: 0.8em !important;
	width: 0.8em !important;
`;

export const PhoneNumberContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	margin-left: 15px;
`;

export const PhoneNumberType = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.6);
`;

export const PhoneNumber = styled.div`
	color: var(--color-primary);
`;
