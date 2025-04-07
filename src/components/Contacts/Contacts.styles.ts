import styled from 'styled-components';
import { ListItem } from '@mui/material';

const StyledListItem = styled(ListItem)``;

export const ContactsBody = styled.div`
	position: relative;
	flex: 1 1;
	overflow-x: hidden;
	overflow-y: auto;

	${StyledListItem} {
		padding: 0;
	}
`;

export const BodyHint = styled.span`
	display: block;
	padding: 10px 15px;
	font-size: 14px;
	color: rgba(0, 0, 45, 0.6);
`;

export const BodyLoading = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	background-color: rgba(255, 255, 255, 0.5);
	color: var(--color-primary);
	display: flex;
	align-items: center;
	justify-content: center;
`;
