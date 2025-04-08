import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	position: absolute;
	bottom: -3px;
	right: -3px;
	padding: 3px;
	background-color: white;
	border-radius: 10px;
	box-shadow: 0 1px 3px var(--shadow-light);

	& > img {
		height: 13px;
		width: 13px;
		vertical-align: middle;
	}
`;
