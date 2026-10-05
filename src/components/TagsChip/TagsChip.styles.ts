import styled from 'styled-components';

export const Container = styled.div.attrs({
	className: 'tagsChip',
})<{ $isClickable?: boolean }>`
	position: relative;
	background-color: rgba(0, 0, 45, 0.06);
	border-radius: 10px;
	font-size: 12px;
	height: 19px;
	display: flex;
	flex-direction: row;
	align-items: center;
	user-select: none;
	outline: none;
	cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};

	&:focus-visible {
		box-shadow: 0 0 0 2px var(--color-primary);
	}

	.app-icon {
		color: var(--default-text-color) !important;
		height: 0.6em;
		width: 0.6em;
		margin: 0 3px;
	}
`;

export const Avatar = styled.div<{ $iconColor?: string }>`
	height: 19px !important;
	width: 19px !important;
	font-size: 11px !important;
	margin-right: 5px;
	align-self: center;
	background-color: ${({ $iconColor }) =>
		$iconColor ? 'white !important' : 'inherit'};

	.app-icon {
		color: ${({ $iconColor }) =>
			$iconColor ? $iconColor : 'rgba(0, 0, 0, 0.6)'} !important;
		height: 0.5em;
		width: 0.5em;
	}
`;

export const Label = styled.span<{ $isWider?: boolean }>`
	max-width: ${({ $isWider }) => ($isWider ? '110px' : '55px')};
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	margin-left: -2px;
	margin-right: 5px;
`;

export const ActionIcon = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 19px;
	width: 19px;
	margin-left: -2px;
	border-radius: 50%;
`;
