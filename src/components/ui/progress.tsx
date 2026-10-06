import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import { Progress as ProgressPrimitive } from 'radix-ui';

/*
 * Replaces MUI's LinearProgress. Leave `value` out for the indeterminate bar
 * (MUI's variant="indeterminate"). `color` sets the `--progress` hue of both
 * the bar and its track; for anything else, style the track with `className`
 * and the bar with `indicatorClassName`.
 */
const progressVariants = cva(
	'relative w-full overflow-hidden rounded-full bg-(--progress)/20',
	{
		variants: {
			color: {
				primary: '[--progress:var(--primary)]',
				secondary: '[--progress:var(--color-secondary)]',
				destructive: '[--progress:var(--destructive)]',
				selection: '[--progress:var(--selection)]',
			},
			size: {
				sm: 'h-1',
				default: 'h-1.5',
				lg: 'h-2.5',
			},
		},
		defaultVariants: {
			color: 'primary',
			size: 'default',
		},
	}
);

function Progress({
	className,
	indicatorClassName,
	color,
	size,
	value,
	...props
}: Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, 'color'> &
	VariantProps<typeof progressVariants> & {
		indicatorClassName?: string;
	}) {
	const isIndeterminate = value === undefined || value === null;

	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			className={cn(progressVariants({ color, size }), className)}
			value={value}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className={cn(
					'h-full rounded-full bg-(--progress)',
					isIndeterminate
						? 'w-2/5 animate-progress-indeterminate'
						: 'w-full transition-transform duration-300',
					indicatorClassName
				)}
				style={
					isIndeterminate
						? undefined
						: { transform: `translateX(-${100 - value}%)` }
				}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress, progressVariants };
