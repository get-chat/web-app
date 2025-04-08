import styled from 'styled-components';
import { Avatar } from '@mui/material';

export const ContactWrapper = styled.div`
	background-color: white;
`;

export const ContactContainer = styled.div`
	display: flex;
	align-items: center;
	flex: 1 1;
	padding: 10px 15px;
	cursor: pointer;
`;

export const StyledAvatar = styled(Avatar);

export const AvatarWrapper = styled.div`
	position: relative;

	${StyledAvatar} {
		align-self: baseline;
		height: 50px;
		width: 50px;
	}
`;

export const ContactProviderHeaderWrapper = styled.div`
	display: flex;
	position: absolute;
	bottom: -3px;
	right: -3px;
	padding: 3px;
	background-color: white;
	border-radius: 10px;
	box-shadow: 0 1px 3px var(--shadow-light);
`;

export const ContactInfo = styled.div`
	flex: 1 1;
	margin-left: 15px;

	h2 {
		font-weight: 600;
		font-size: 14px;
	}
`;

export const PhoneNumber = styled.div`
	font-size: 14px;
	color: var(--color-primary);
`;

export const MissingPhoneNumber = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.4);
`;

export const OtherPhoneNumbers = styled.div`
	display: flex;
	flex-direction: row;
	font-size: 12px;
	color: rgba(0, 0, 45, 0.6);
`;

export const PhoneNumbersChoices = styled.div`
	background-color: var(--color-primary-transparent);
	padding: 10px 15px;

	h3 {
		font-size: 12px;
		color: var(--color-primary);
	}
`;

export const PhoneNumberChoice = styled.div`
	cursor: pointer;
	display: inline-block;
	font-size: 14px;
	padding: 5px 10px;
	border-radius: 15px;
	background-color: white;
	color: var(--color-primary);
	margin-top: 5px;
	margin-right: 10px;
	box-shadow: 0 4px 5px -6px rgba(0, 0, 45, 0.4);
	transition: box-shadow ease 0.3s;

	&:hover {
		box-shadow: 0 4px 10px -6px rgba(0, 0, 45, 0.4);
	}
`;
