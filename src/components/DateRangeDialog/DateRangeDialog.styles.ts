import styled from 'styled-components';
import { FormControl } from '@mui/material';

export const CalendarContainer = styled.div`
	border-radius: 10px;
	background-color: var(--gray-light);
	box-shadow: 0 6px 6px -6px rgba(0, 0, 45, 0.2);

	.rdrStaticRange {
		border-bottom: none;
	}
`;

export const WeekStartDaySelectorContainer = styled.div`
	display: flex;
	margin: 15px 15px 0;
`;

export const FormControlStyled = styled(FormControl)`
	min-width: 135px !important;

	.MuiFormLabel-root {
		background-color: #fff !important;
	}

	.MuiSelect-select {
		padding: 8px 32px 8px 10px !important;
	}
`;
