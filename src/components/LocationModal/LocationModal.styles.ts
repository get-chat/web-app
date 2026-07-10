import styled from 'styled-components';
import { DialogContent, DialogTitle } from '@mui/material';

export const StyledDialogTitle = styled(DialogTitle)`
	background-color: var(--color-primary);
	color: white;
`;

export const StyledDialogContent = styled(DialogContent)`
	padding: 0 !important;
`;

export const MapWrapper = styled.div`
	position: relative;
	width: 100%;
	height: 320px;
	background-color: rgba(0, 0, 45, 0.06);
	border-radius: 10px;
	overflow: hidden;
	margin-top: 8px;
`;

// This element's DOM is fully managed by Google Maps once the map is
// initialized. React must never render children into it.
export const MapCanvas = styled.div`
	width: 100%;
	height: 100%;
`;

export const MapOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba(0, 0, 45, 0.6);
	font-size: 14px;
	padding: 16px;
	text-align: center;
	background-color: rgba(255, 255, 255, 0.8);
`;

export const Fields = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px 24px 8px;
`;

export const CurrentLocationRow = styled.div`
	padding: 8px 24px 0;
`;

export const Coordinates = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.5);
	padding: 0 24px;
`;
