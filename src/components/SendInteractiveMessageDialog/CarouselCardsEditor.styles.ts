import styled from 'styled-components';

export const Container = styled.div`
	margin-top: 15px;
`;

export const Card = styled.div`
	padding: 10px;
	border-radius: 10px;
	background-color: rgba(0, 0, 45, 0.03);
	margin-bottom: 10px;
`;

export const CardHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: rgba(0, 0, 45, 0.5);
	font-size: 12px;
`;

export const FieldRow = styled.div`
	display: flex;
	align-items: flex-end;
	gap: 5px;
	margin-top: 5px;
`;

export const ErrorText = styled.span`
	color: #d32f2f;
	font-size: 12px;
	align-self: center;
`;
