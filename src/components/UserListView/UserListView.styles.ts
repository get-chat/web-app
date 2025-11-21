import styled from 'styled-components';

export const Container = styled.div`
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

export const Description = styled.div`
	display: flex;
	padding: 15px;
	background-color: var(--gray-lighter);
	font-size: 14px;
`;

export const Body = styled.div`
	position: relative;
	flex: 1 1;
	overflow-x: hidden;
	overflow-y: auto;
`;

export const UserItem = styled.div`
	padding: 10px 15px;
	display: flex;
	gap: 10px;
	align-items: center;
	justify-content: space-between;
`;

export const UserMeta = styled.div`
	display: flex;
	gap: 10px;
	align-items: center;
	font-weight: 600;
	font-size: 14px;
`;

export const UserAvailability = styled.div`
	display: flex;
	gap: 10px;
	align-items: center;
	font-size: 14px;
`;
