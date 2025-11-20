import styled from 'styled-components';

export const Container = styled.div<{
	$isAvailable: boolean;
}>`
	padding: 10px 6px 10px 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${(props) => (props.$isAvailable ? '#c9e4cb' : '#f5d597')};
	color: ${(props) => (props.$isAvailable ? '#2e7d33' : '#644916')};
	transition: background-color 0.2s ease-in-out;
	cursor: pointer;
`;

export const Title = styled.div`
	font-size: 14px;
	font-weight: 600;
`;

export const Description = styled.div`
	font-size: 12px;
	font-weight: 500;
`;
