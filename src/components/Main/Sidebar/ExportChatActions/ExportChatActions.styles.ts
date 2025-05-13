import styled from 'styled-components';

export const Container = styled.div`
	background-color: var(--color-light-blue);
	padding: 10px 15px;
	display: flex;
	flex-direction: column;
`;

export const Title = styled.h3`
	font-weight: 400;
	font-size: 18px;
	color: white;
	margin: 0;
`;

export const Recipients = styled.div`
	font-size: 14px;
	color: white;
`;

export const Actions = styled.div`
	margin-top: 15px;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;

	.MuiButton-text {
		color: white;
	}

	.MuiButton-root:first-of-type .MuiButton-label {
		opacity: 0.75;
	}
`;
