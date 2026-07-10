import styled from 'styled-components';

export const CreateTagForm = styled.div`
	padding: 6px 12px 10px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	min-width: 240px;
`;

export const CreateTagInputRow = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
`;

export const ColorSwatchRow = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
`;

export const ColorSwatch = styled.button<{
	$color: string;
	$isSelected?: boolean;
}>`
	width: 20px;
	height: 20px;
	padding: 0;
	border-radius: 50%;
	cursor: pointer;
	background-color: ${({ $color }) => $color};
	border: 2px solid
		${({ $isSelected }) =>
			$isSelected ? 'var(--default-text-color, #212329)' : 'transparent'};
	box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
	transition: transform 0.1s ease-in-out;

	&:hover {
		transform: scale(1.1);
	}
`;
