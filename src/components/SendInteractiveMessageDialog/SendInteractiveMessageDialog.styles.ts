import styled from 'styled-components';
import Alert from '@mui/material/Alert';

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	gap: 30px;

	@media only screen and (max-width: 750px) {
		flex-direction: column;
	}
`;

export const Section = styled.div`
	padding: 15px;
	border-radius: 10px;
	background-color: rgba(0, 0, 45, 0.03);
	margin-top: 10px;
`;

export const SectionTitle = styled.div`
	color: rgba(0, 0, 45, 0.5);
	margin-bottom: 5px;
`;

export const Description = styled.div`
	font-size: 14px;

	@media only screen and (max-width: 750px) {
		font-size: 12px;
	}
`;

export const StyledAlert = styled(Alert)`
	font-size: 12px !important;
	margin-top: 15px;
	padding: 4px 10px !important;

	a {
		font-weight: 600;
	}
`;

export const TextFieldWrapper = styled.div`
	margin-top: 10px;
`;

export const HelperText = styled.div`
	font-size: 12px;
	color: #6f7385;
	margin-top: 5px;

	a {
		color: var(--color-primary);
	}
`;

export const AdvancedToggle = styled.div`
	margin-top: 30px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	color: #6f7385;
`;

export const Advanced = styled.div``;

export const PreviewContainer = styled.div`
	background-color: var(--chat-bg);
	padding: 10px;
	border-radius: 10px;
	overflow-y: auto;
	min-width: 300px;

	@media only screen and (max-width: 750px) {
		min-width: auto;
	}

	.chat__message {
		margin-top: 0;
	}
`;
