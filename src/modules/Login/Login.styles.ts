import styled from 'styled-components';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

export const LoginWrapper = styled.div.attrs({
	id: 'login',
})`
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
	border-radius: 15px;
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
		color: var(--lighter-text-color);
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

export const SessionCard = styled(ButtonBase)`
	width: 100%;
	font-family: inherit;
	display: flex !important;
	align-items: center !important;
	gap: 12px;
	padding: 12px 16px !important;
	border: 1px solid rgba(101, 203, 172, 0.5) !important;
	border-radius: 10px !important;
	background-color: #fff !important;
	text-align: left !important;
	box-shadow: 0 2px 10px -4px rgba(101, 203, 172, 0.4);
	transition: border-color 0.25s ease, background-color 0.25s ease,
		box-shadow 0.25s ease;

	.MuiAvatar-root {
		width: 44px;
		height: 44px;
		font-size: 18px;
	}

	&:hover {
		border-color: var(--color-primary) !important;
		background-color: var(--color-primary-transparent) !important;
		box-shadow: 0 4px 16px -6px rgba(101, 203, 172, 0.7);
	}

	&:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		transition: none;
	}
`;

export const SessionCardInfo = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const SessionCardLabel = styled.div`
	font-size: 12px;
	color: var(--lighter-text-color);
`;

export const SessionCardName = styled.div`
	font-size: 15px;
	font-weight: 600;
	color: var(--text-color, #212329);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const SessionCardArrow = styled(ArrowForwardRoundedIcon)`
	color: var(--color-primary);
	flex-shrink: 0;
	/* !important as MUI's own SvgIcon transition (fill 200ms) overrides this otherwise */
	transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;

	${SessionCard}:hover & {
		transform: translateX(4px);
	}

	@media (prefers-reduced-motion: reduce) {
		transition: none !important;

		${SessionCard}:hover & {
			transform: none;
		}
	}
`;

export const OrDivider = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 15px 0 5px;
	color: var(--lighter-text-color);
	font-size: 12px;

	&::before,
	&::after {
		content: '';
		flex: 1;
		height: 1px;
		background-color: var(--gray-light);
	}
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
