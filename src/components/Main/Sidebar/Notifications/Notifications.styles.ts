import styled from 'styled-components';

export const NotificationsContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
	display: flex;
	flex-direction: column;
`;

export const Header = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	padding: 4px 15px;
	background-color: var(--color-primary);
	color: white;

	h3 {
		font-weight: 400;
		font-size: 18px;
		margin: 10px 15px;
	}

	.MuiSvgIcon-root {
		color: white !important;
	}
`;

export const Body = styled.div`
	position: relative;
	flex: 1 1;
	overflow-x: hidden;
	overflow-y: auto;
`;

export const EmptyState = styled.div`
	padding: 10px 15px;
	font-size: 14px;
`;

export const NotificationItem = styled.div<{ $error?: boolean }>`
	display: flex;
	flex-direction: column;
	padding: 10px 15px;
	font-size: 12px;
	background-color: white;

	${({ $error }) =>
		$error &&
		`
    background-color: rgba(255, 0, 0, 0.025);
  `}

	> h3 {
		font-weight: 400;
		font-size: 14px;
		margin-bottom: 10px;

		${({ $error }) =>
			$error &&
			`
      color: rgba(255, 0, 0, 0.8);
    `}
	}
`;

export const Timestamp = styled.div`
	font-size: 10px;
	color: rgba(0, 0, 45, 0.6);
	align-self: flex-end;
`;

export const CodeWrapper = styled.div<{ $error?: boolean }>`
	border-radius: 5px;
	background-color: var(--gray-light);
	padding: 5px 10px;

	${({ $error }) =>
		$error &&
		`
    background-color: #ffe8e8;
  `}
`;
