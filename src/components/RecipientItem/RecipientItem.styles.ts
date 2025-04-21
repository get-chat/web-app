import styled from 'styled-components';
import { Checkbox, ListItemButton } from '@mui/material';
import CustomAvatar from '@src/components/CustomAvatar';

export const Wrapper = styled.div`
	background-color: white;
`;

export const StyledListItemButton = styled(ListItemButton)`
	padding: 0 !important;
	margin: 0 !important;
`;

export const StyledCustomAvatar = styled(CustomAvatar)``;

export const Container = styled.div`
	display: flex;
	align-items: center;
	flex: 1 1;
	padding: 10px 15px;
	cursor: pointer;

	${StyledCustomAvatar} {
		align-self: baseline;
		height: 50px;
		width: 50px;
	}
`;

export const AvatarWrapper = styled.div`
	position: relative;
`;

export const Info = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1 1;
	margin-left: 15px;
`;

export const Name = styled.div`
	font-weight: 600;
	font-size: 14px;
`;

export const PhoneNumber = styled.div`
	font-size: 14px;
	color: var(--color-primary);
`;

export const MissingPhoneNumber = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.4);
`;

export const PhoneNumbersContainer = styled.div`
	background-color: var(--color-primary-transparent);
	padding: 10px 15px;
`;

export const PhoneNumbersTitle = styled.div`
	font-size: 12px;
	color: var(--color-primary);
`;

export const Choice = styled.div`
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

export const SelectionCheckbox = styled(Checkbox)``;
