import styled from 'styled-components';
import { ButtonBase } from '@mui/material';
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

export const MessageButton = styled(ButtonBase)`
	flex: 1;
	display: flex;
	flex-direction: row;
	justify-content: center;
	border-radius: 4px !important;
	padding: 3px 5px !important;
	margin-bottom: 5px !important;

	.MuiTouchRipple-child {
		background-color: red;
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
