import styled from 'styled-components';
import { Field } from '@src/components/ui/field';

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

export const FormControlStyled = styled(Field)`
	width: auto;
	min-width: 135px;
	gap: 6px;
`;
