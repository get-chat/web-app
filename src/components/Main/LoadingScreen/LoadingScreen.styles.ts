import styled from 'styled-components';

export const Container = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: var(--gray-light);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 30px 60px;
	z-index: 500;
`;

export const LogoWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 50px;
	width: 100%;
	max-width: 400px;

	img {
		height: 80px;
		width: 80px;
	}
`;

export const ProgressContainer = styled.div`
	width: 100%;
	max-width: 400px;

	.MuiLinearProgress-root {
		height: 3px;
	}
`;

export const Details = styled.div`
	font-size: 16px;
	font-weight: 600;
	color: rgba(0, 0, 45, 0.4);
	margin: 15px 0;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;

	.MuiCircularProgress-root {
		margin: 10px;
	}
`;

export const LongTransactionInfo = styled.div`
	margin-bottom: 10px;
	font-size: 14px;
	color: rgba(0, 0, 45, 0.3);
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
`;

export const Actions = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 10px;
`;

export const ContactLink = styled.a`
	display: inline-block;
	cursor: pointer;
	font-size: 18px;
	color: var(--color-primary);
	padding: 10px;
`;

export const Version = styled.span`
	display: block;
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translate(-50%, 0);
	margin-bottom: 15px;
	font-size: 12px;
	color: var(--lighter-text-color);
`;
