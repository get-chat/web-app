import styled from 'styled-components';
import CustomAvatar from '@src/components/CustomAvatar';
import { Checkbox } from '@src/components/ui/checkbox';

export const Wrapper = styled.div`
	background-color: white;
`;

// A clickable list row, like MUI's ListItemButton it replaces. A div, not a
// button, because the selection checkbox inside is a button itself.
export const StyledListItemButton = styled.div`
	display: flex;
	align-items: center;
	position: relative;
	min-width: 0;
	padding: 0;
	margin: 0;
	text-align: left;
	cursor: pointer;
	outline: none;
	transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		background-color: rgba(0, 0, 0, 0.04);
	}

	&:focus-visible {
		background-color: rgba(0, 0, 0, 0.12);
	}
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

// The margins keep the room MUI's padded checkbox took
export const SelectionCheckbox = styled(Checkbox)`
	margin: 0 12px;
`;
