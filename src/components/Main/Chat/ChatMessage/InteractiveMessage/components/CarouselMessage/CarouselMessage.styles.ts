import styled from 'styled-components';

export const Message = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
`;

export const Body = styled.div`
	font-weight: normal;
`;

export const Cards = styled.div`
	display: flex;
	flex-direction: row;
	gap: 8px;
	overflow-x: auto;
	padding-bottom: 5px;
`;

export const Card = styled.div`
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	width: 200px;
	border: 1px solid rgba(0, 0, 45, 0.1);
	border-radius: 10px;
	overflow: hidden;
`;

export const CardMedia = styled.div`
	height: 110px;
	background-color: rgba(0, 0, 45, 0.05);

	img,
	video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

export const CardBody = styled.div`
	padding: 5px 8px;
	font-size: 0.9em;
	white-space: pre-wrap;
`;

export const CardActions = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: auto;
`;
