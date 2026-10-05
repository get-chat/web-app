import styled from 'styled-components';
import { Button } from '@src/components/ui/button';

export const Container = styled.div.attrs({
	role: 'button',
	tabIndex: 0,
})<{ $isActive?: boolean }>`
	&& {
		position: relative;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		outline: 0;
		-webkit-tap-highlight-color: transparent;
		background-color: ${({ $isActive }) =>
			$isActive ? 'var(--color-primary) !important' : 'white !important'};
		border-radius: 10px !important;
		font-size: 12px;
		height: 19px;
		display: inline-flex !important;
		flex-direction: row;
		align-items: center !important;
		vertical-align: top !important;
		padding: 0 0 0 5px !important;
		margin-right: 5px !important;
		color: ${({ $isActive }) => ($isActive ? 'white' : 'inherit')};

		&:focus-visible {
			box-shadow: 0 0 0 2px rgba(101, 203, 172, 0.5);
		}

		.MuiSvgIcon-root {
			height: 12px !important;
			width: 12px !important;
			color: ${({ $isActive }) => ($isActive ? 'white !important' : 'inherit')};
		}
	}
`;

export const Label = styled.div`
	margin: 0 5px;
`;

export const ActionIcon = styled(Button)`
	&& {
		height: 19px !important;
		width: 19px !important;
		margin-left: -2px !important;
		border-radius: 50%;

		.MuiSvgIcon-root {
			color: white !important;
		}
	}
`;
