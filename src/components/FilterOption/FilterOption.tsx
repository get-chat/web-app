import React, { KeyboardEvent, MouseEvent } from 'react';
import CloseIcon from '@src/components/icons/Close';
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
			onClick={onClick}
			onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
				// Keyboard activation, as MUI's ButtonBase did for a div
				if (event.target === event.currentTarget) {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						onClick(event as unknown as MouseEvent);
					}
				}
			}}
			$isActive={isActive}
		>
			{icon}
			<Styled.Label>{label}</Styled.Label>
			{isActive && (
				<Styled.ActionIcon
					type="button"
					variant="ghost"
					color="neutral"
					size="icon-sm"
				>
					<CloseIcon />
				</Styled.ActionIcon>
			)}
		</Styled.Container>
	);
};

export default FilterOption;
