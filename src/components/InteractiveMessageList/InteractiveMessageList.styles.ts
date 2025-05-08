import styled from 'styled-components';

export const List = styled.div.attrs({
	className: 'interactiveMessages',
})`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const Item = styled.div`
	display: flex;
	flex-direction: row;
	font-size: 14px;

	& > .MuiButton-root {
		width: 100%;
		justify-content: flex-start;
	}

	& .chat__message {
		margin-bottom: 0;
	}

	& .MuiButton-text {
		text-align: left;
	}
`;

export const Alert = styled.div`
	font-size: 12px;

	& a {
		font-weight: 600;
	}
`;

export const Description = styled.div`
	font-size: 12px;
`;
