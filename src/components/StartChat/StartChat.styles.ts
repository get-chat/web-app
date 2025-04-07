import styled from 'styled-components';
import { ListItem, TextField } from '@mui/material';

const StyledListItem = styled(ListItem)``;
const StyledTextField = styled(TextField)``;

export const ContactsContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
	z-index: 10;
`;

export const ContactsHeader = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	font-size: 18px;
	padding: 4px 15px;
	background-color: var(--color-primary);
	color: white;

	h3 {
		margin-left: 15px;
		font-weight: 400;
		font-size: 18px;
	}

	.MuiSvgIcon-root {
		color: white !important;
	}
`;

export const StartByPhoneNumberWrapper = styled.div`
	background-color: white;
`;

export const StartByPhoneNumber = styled.div`
	background-color: var(--color-primary-transparent);
	color: var(--color-primary);

	${StyledListItem} {
		padding: 0;

		&:hover {
			background-color: var(--color-primary-transparent-darker);
		}
	}
`;

export const StartByPhoneNumberInner = styled.div`
	flex: 1;
	padding: 20px 15px;

	.MuiSvgIcon-root {
		height: 0.8em;
		width: 0.8em;
		color: var(--color-primary) !important;
		margin-right: 10px;
	}
`;

export const FormWrapper = styled.div`
	display: flex;
	padding: 10px 15px;

	${StyledTextField} {
		flex: 1;
		margin-right: 15px;
	}
`;
