import React, { KeyboardEvent, MouseEvent } from 'react';
import CloseIcon from '@src/components/icons/Close';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';

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
		<div
			role="button"
			tabIndex={0}
			className={cn(
				'relative mr-1.25 inline-flex h-4.75 cursor-pointer items-center justify-center rounded-[10px] pl-1.25 align-top text-[12px] outline-none! select-none [-webkit-tap-highlight-color:transparent] focus-visible:shadow-[0_0_0_2px_rgba(101,203,172,0.5)] [&_.app-icon]:size-3!',
				isActive
					? 'bg-primary text-white [&_.app-icon]:text-white!'
					: 'bg-white'
			)}
			onClick={onClick}
			onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
				// Keyboard activation, as for a button
				if (event.target === event.currentTarget) {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						onClick(event as unknown as MouseEvent);
					}
				}
			}}
		>
			{icon}
			<div className="mx-1.25">{label}</div>
			{isActive && (
				<Button
					variant="ghost"
					color="neutral"
					size="icon-sm"
					className="-ml-0.5 size-4.75 rounded-full"
				>
					<CloseIcon />
				</Button>
			)}
		</div>
	);
};

export default FilterOption;
