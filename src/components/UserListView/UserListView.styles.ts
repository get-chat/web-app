import styled from 'styled-components';
import { Button } from '@src/components/ui/button';
import {
	overlayPanelTransition,
	PanelTransitionStyleProps,
} from '@src/styles/panelTransitions';

export const Container = styled.div<PanelTransitionStyleProps>`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
	display: flex;
	flex-direction: column;

	${overlayPanelTransition}
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

	.app-icon {
		color: white !important;
	}
`;

export const Description = styled.div`
	display: flex;
	padding: 15px;
	background-color: var(--gray-lighter);
	font-size: 14px;
`;

export const Actions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 15px;
`;

export const CreateUserButton = styled(Button)`
	&& {
		justify-content: flex-start;
		gap: 8px;
		width: 100%;
		height: auto;
		padding: 11px 15px;
		font-size: 14px;
		color: var(--default-text-color);
		background-color: white;
		border: 1px solid var(--gray-light);

		.app-icon {
			width: 20px;
			height: 20px;
			/* App.css greys every MUI icon outside MUI buttons */
			color: var(--color-primary) !important;
		}

		&:hover {
			background-color: var(--color-primary-transparent);
			box-shadow: inset 0 0 0 1px var(--color-primary), var(--shadow-md);
		}
	}
`;

export const Hint = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 7px;
	font-size: 12.5px;
	line-height: 1.45;
	color: var(--lighter-text-color);

	.app-icon {
		font-size: 16px;
		flex-shrink: 0;
		margin-top: 1px;
	}
`;

export const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	padding: 15px;
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
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const UserInfo = styled.div`
	display: flex;
	flex-direction: column;
	min-width: 0;
	flex: 1;
`;

export const UserUsername = styled.div`
	font-weight: 600;
	font-size: 14px;
	color: var(--default-text-color);
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const UserEmail = styled.div`
	font-weight: 400;
	font-size: 13px;
	color: var(--default-text-color);
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const UserRole = styled.div`
	font-weight: 500;
	font-size: 12px;
	color: var(--lighter-text-color);
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const UserAvailability = styled.div<{
	$isAvailable: boolean;
	$hasSwitch: boolean;
}>`
	display: flex;
	gap: 10px;
	align-items: center;
	font-size: 14px;
	padding: ${(props) => (props.$hasSwitch ? '0 0 0 15px' : '4px 15px')};
	border-radius: 20px;
	width: ${(props) => (props.$hasSwitch ? '140px' : 'auto')};
	flex-shrink: 0;
	justify-content: space-between;
	background-color: ${(props) => (props.$isAvailable ? '#c9e4cb' : '#f5d597')};
	color: ${(props) => (props.$isAvailable ? '#2e7d33' : '#644916')};
	transition: background-color 0.2s ease-in-out;
`;

export const UserAvailabilityLabel = styled.div`
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;
