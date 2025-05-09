import styled from 'styled-components';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import BoltIcon from '@mui/icons-material/Bolt';

export const Container = styled.div<{ $isSelected: boolean }>`
	padding: 5px 15px;
	display: flex;
	flex-direction: column;
	cursor: pointer;
	font-size: 14px;

	${({ $isSelected }) =>
		$isSelected &&
		`
    background-color: var(--gray-lighter);
  `}
`;

export const Command = styled.span<{ $isStatic: boolean }>`
	overflow: hidden;

	${({ $isStatic }) =>
		$isStatic &&
		`
    background-color: var(--gray-light);
    border-radius: 4px;
    padding: 2px 4px;
    border: 2px solid white;
  `}
`;

export const CommandIcon = styled.div`
	height: 20px !important;
	width: 20px !important;
	margin-right: 5px;
`;

export const StaticCommandIcon = styled(KeyboardCommandKeyIcon)`
	color: #50da26 !important;
`;

export const DynamicCommandIcon = styled(BoltIcon)`
	color: #ffbe1b !important;
`;

export const Description = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.6);
	white-space: pre-line;
	margin: 1px 0 0 25px;
`;
