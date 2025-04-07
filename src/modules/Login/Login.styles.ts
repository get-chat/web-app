import styled from 'styled-components';
import Button from '@mui/material/Button';

export const LoginWrapper = styled.div`
	position: absolute;
	align-items: center;
	justify-content: center;
	display: flex;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	/*background-color: var(--gray-light);*/

	@media only screen and (max-width: 750px) {
		background-color: white;
	}
`;

export const LoginBody = styled.div`
	position: relative;
	width: 100%;
	max-width: 450px;
	background-color: white;
	border-radius: 10px;
	box-shadow: 0 4px 10px -6px rgba(0, 0, 45, 0.7);
	padding: 20px 30px 30px 30px;

	@media only screen and (max-width: 750px) {
		max-width: 100%;
		border-radius: 0;
		box-shadow: none;
	}

	h2 {
		margin-bottom: 5px;
		text-align: center;
	}

	p {
		margin-bottom: 15px;
		text-align: center;
	}

	> form > button {
		margin: 5px auto 10px;
	}

	.MuiFormControl-root {
		margin-bottom: 15px;
	}

	.MuiButton-label {
		font-size: 18px;
	}

	.MuiAlert-root {
		margin-top: 15px;
	}
`;

export const LogoWrapper = styled.div`
	clear: both;
	display: flex;
	justify-content: center;
`;

export const Logo = styled.img`
	height: 80px;
	width: 80px;
	margin-top: 15px;
	margin-bottom: 15px;
`;

export const InboxUrl = styled.div`
	font-size: 12px;
	text-align: center;
	margin-block: 15px;

	a {
		color: var(--color-secondary);
	}
`;

export const AdminPanelButton = styled(Button)`
	margin-top: 10px !important;
`;

export const ValidatingToken = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
	border-radius: 10px;
`;

export const VersionWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 45px;
	margin-bottom: -75px;
`;

export const Version = styled.div`
	font-size: 12px;
	color: var(--lighter-text-color);
`;

export const Backdrop = styled.div`
	color: #fff;
`;
