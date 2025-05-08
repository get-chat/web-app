import styled from 'styled-components';
import { DoneAll } from '@mui/icons-material';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	flex: 0.4 1;
	border-left: 1px solid lightgray;
	z-index: 10;

	@media only screen and (max-width: 750px) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-left: none;
	}
`;

export const Header = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	padding: 4px 15px;
	background-color: var(--gray-light);

	> h3 {
		margin-left: 15px;
		font-weight: 400;
		font-size: 18px;
	}

	@media only screen and (max-width: 750px) {
		padding: 4px 10px;
	}
`;

export const Body = styled.div`
	background-color: var(--gray-light);
	flex: 1 1;
	position: relative;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
`;

export const Preview = styled.div`
	background-color: var(--chat-bg);
	padding: 15px;
	box-shadow: 0 1px 3px var(--shadow-light);
	margin-bottom: 10px;

	.chat__message.hiddenSender {
		margin-top: 0;
		margin-bottom: 0;
	}
`;

export const Section = styled.div`
	padding: 20px;
	background-color: white;
	display: flex;
	flex-direction: column;
	gap: 10px;
	box-shadow: 0 1px 3px var(--shadow-light);
	margin-bottom: 10px;
`;

export const SubSection = styled.div`
	display: flex;
	flex-direction: column;
`;

export const SubSectionTitle = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;

	.MuiSvgIcon-root {
		margin-right: 5px;
		height: 0.7em !important;
		width: 0.7em !important;
	}
`;

export const SubSectionText = styled.div`
	color: rgba(0, 0, 45, 0.6);
`;

export const Reaction = styled.div`
	.sender {
		font-size: 14px;
	}

	.timestamp {
		color: rgba(0, 0, 45, 0.6);
		font-size: x-small;
		margin-bottom: 5px;
	}
`;

export const BlueIcon = styled(DoneAll)`
	fill: var(--color-light-blue) !important;
`;
