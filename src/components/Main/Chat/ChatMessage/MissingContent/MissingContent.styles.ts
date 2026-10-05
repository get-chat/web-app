import styled from 'styled-components';
import { Alert } from '@src/components/ui/alert';

// A compact filled alert, sized to its text (App.css used to round MUI alerts
// to 12px)
export const StyledAlert = styled(Alert)`
	padding: 2px 8px !important;
	width: max-content;
	border-radius: 12px;
	font-weight: 500;
`;
