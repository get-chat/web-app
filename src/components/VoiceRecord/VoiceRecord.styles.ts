import styled from 'styled-components';
import { IconButton } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { keyframes } from 'styled-components';

const blinker = keyframes`
  50% {
    opacity: 0.3;
  }
`;

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	background-color: #fff;
	border-radius: 20px;
	box-shadow: 0 4px 5px -6px rgba(0, 0, 45, 0.4);
`;

export const CancelButton = styled(IconButton)`
	&& {
		background-color: transparent !important;
		margin-right: 20px !important;

		&:hover {
			background-color: rgba(255, 0, 0, 0.2) !important;
		}

		.MuiSvgIcon-root {
			color: red !important;
			height: 20px;
			width: 20px;
		}
	}

	@media only screen and (max-width: 750px) {
		&& {
			margin-right: 10px !important;
		}
	}
`;

export const SendButton = styled(IconButton)`
	&& {
		background-color: transparent !important;

		&:hover {
			background-color: rgba(0, 255, 0, 0.2) !important;
		}

		.MuiSvgIcon-root {
			color: green !important;
			height: 20px;
			width: 20px;
		}
	}
`;

export const RecordIcon = styled(FiberManualRecordIcon)`
	&& {
		color: red !important;
		margin-right: 2px;
		animation: ${blinker} 2s linear infinite;
	}
`;

export const Timer = styled.span`
	font-size: 14px;
	font-weight: 600;
	color: rgba(0, 0, 45, 0.82);
	margin-right: 20px;
	min-width: 48px;
	text-align: center;

	@media only screen and (max-width: 750px) {
		margin-right: 10px !important;
	}
`;
