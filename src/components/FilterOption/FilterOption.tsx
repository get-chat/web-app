import React, { MouseEvent } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import * as Styled from './FilterOption.styles';

interface Props {
	icon?: JSX.Element;
	label: string;
	onClick: (event: MouseEvent) => void;
	isActive?: boolean;
}

const FilterOption: React.FC<Props> = ({
	icon,
	label,
	onClick,
	isActive = false,
}) => {
	return (
		<Styled.Container
			// @ts-ignore
			component="div"
			onClick={onClick}
			$isActive={isActive}
		>
			{icon}
			<Styled.Label>{label}</Styled.Label>
			{isActive && (
				<Styled.ActionIcon size="small">
					<CloseIcon />
				</Styled.ActionIcon>
			)}
		</Styled.Container>
	);
};

export default FilterOption;
