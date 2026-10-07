import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@src/components/icons/Close';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';

interface Props {
	icon?: JSX.Element;
	label: string;
	onClick: (event: MouseEvent<HTMLButtonElement>) => void;
	/** The filter is applied: the chip turns mint */
	isActive?: boolean;
	/** Shown as a small remove button while the filter is applied */
	onClear?: () => void;
}

/**
 * A chat list filter chip. The same chip shows the filter as available
 * (outlined) or applied (mint, with a remove button), so a filter never
 * moves when it is toggled. A value filter (group, tag, time) shows the
 * chosen value as its label while applied.
 */
const FilterOption: React.FC<Props> = ({
	icon,
	label,
	onClick,
	isActive = false,
	onClear,
}) => {
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				'inline-flex h-7 max-w-full items-center rounded-full text-[12px] font-medium ring-1 transition-[background-color,color,box-shadow] duration-150 ease-out ring-inset',
				isActive
					? 'bg-primary/28 text-primary-deep ring-transparent hover:bg-primary/38'
					: 'text-ink/70 ring-ink/15 hover:bg-white hover:text-ink hover:ring-ink/25'
			)}
		>
			<Button
				variant="unstyled"
				size="none"
				aria-pressed={isActive}
				className={cn(
					'h-full min-w-0 gap-1.5 rounded-full pl-2.5 [&>.app-icon]:size-3.5!',
					isActive && onClear ? 'pr-1' : 'pr-2.5',
					isActive
						? '[&>.app-icon]:text-primary-deep!'
						: '[&>.app-icon]:text-ink/45!'
				)}
				onClick={onClick}
			>
				{icon}
				<span className="truncate">{label}</span>
			</Button>
			{isActive && onClear && (
				<Button
					variant="unstyled"
					size="none"
					aria-label={t('Remove filter')}
					className="mr-1 size-5 rounded-full text-primary-deep/70 hover:bg-primary-deep/10 hover:text-primary-deep [&_.app-icon]:size-3! [&_.app-icon]:text-current!"
					onClick={onClear}
				>
					<CloseIcon />
				</Button>
			)}
		</div>
	);
};

export default FilterOption;
