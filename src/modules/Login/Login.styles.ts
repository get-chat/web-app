import styled from 'styled-components';
import Alert from '@mui/material/Alert';
import ButtonBase from '@mui/material/ButtonBase';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

export const LoginWrapper = styled.div.attrs({
	id: 'login',
})`
	position: absolute;
	display: flex;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	padding: 24px;
	background: radial-gradient(
			480px 320px at 50% 16%,
			rgba(101, 203, 172, 0.16),
			transparent 70%
		),
		linear-gradient(180deg, var(--gray-lighter), #e9ecf2);

	@media only screen and (max-width: 750px) {
		padding: 0;
		background: white;
	}
`;

export const LoginColumn = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	max-width: 450px;
	margin: auto;
`;

export const LoginBody = styled.div`
	position: relative;
	width: 100%;
	background-color: white;
	border-radius: 15px;
	border: 1px solid rgba(255, 255, 255, 0.8);
	box-shadow: 0 24px 48px -24px rgba(0, 0, 45, 0.35),
		0 1px 2px rgba(0, 0, 45, 0.06);
	padding: 30px 32px 26px;

	@media only screen and (max-width: 750px) {
		border-radius: 0;
		border: none;
		box-shadow: none;
	}

	h2 {
		margin: 0 0 4px;
		text-align: center;
		font-size: 24px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	p {
		margin: 0 0 20px;
		text-align: center;
		color: var(--lighter-text-color);
	}

	> form > button {
		margin: 8px 0 0;
		border-radius: 10px;
		text-transform: none;
		font-size: 15px;
		font-weight: 600;
		padding-block: 10px;
	}

	.MuiFormControl-root {
		margin-bottom: 15px;
	}
`;

export const LogoWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 20px;

	@media only screen and (max-width: 750px) {
		margin-top: 40px;
	}
`;

export const Logo = styled.img`
	height: 64px;
	width: 64px;
`;

export const InboxUrl = styled.div`
	font-size: 12px;
	text-align: center;
	margin-block: 0 15px;

	a {
		color: var(--color-secondary);
	}
`;

export const LoginAlert = styled(Alert)`
	border-radius: 10px !important;
	margin-bottom: 15px;
	align-items: center;
`;

export const AdminPanelRow = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 18px;
`;

export const AdminPanelLink = styled.a`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	color: var(--lighter-text-color);
	text-decoration: none;
	transition: color 0.2s ease;

	svg {
		font-size: 15px;
	}

	&:hover {
		color: var(--default-text-color);
	}

	&:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		transition: none;
	}
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
	border-radius: 15px;
`;

export const VersionWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 20px;

	@media only screen and (max-width: 750px) {
		margin-bottom: 20px;
	}
`;

export const Version = styled.div`
	font-size: 11px;
	letter-spacing: 0.02em;
	color: var(--lighter-text-color);
	opacity: 0.8;
`;

export const Backdrop = styled.div`
	color: #fff;
`;
