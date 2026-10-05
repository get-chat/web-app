import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import { Switch as SwitchPrimitive } from 'radix-ui';

/*
 * Replaces MUI's Switch. MUI's onChange(event) becomes
 * onCheckedChange(checked). `color` only sets the `--control` hue of the track
 * when on; style the thumb with `thumbClassName`.
 */
const switchVariants = cva(
	'peer group/switch inline-flex h-(--switch-h) w-(--switch-w) shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-[background-color,box-shadow] outline-none! focus-visible:ring-[3px] focus-visible:ring-(--control)/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-(--control) data-[state=unchecked]:bg-[#c4cad0]',
	{
		variants: {
			color: {
				primary: '[--control:var(--primary)]',
				secondary: '[--control:var(--color-secondary)]',
				destructive: '[--control:var(--destructive)]',
				selection: '[--control:var(--selection)]',
			},
			// Any size works: set --switch-w and --switch-h
			size: {
				sm: '[--switch-h:16px] [--switch-w:28px]',
				default: '[--switch-h:20px] [--switch-w:36px]',
				lg: '[--switch-h:24px] [--switch-w:44px]',
			},
		},
		defaultVariants: {
			color: 'primary',
			size: 'default',
		},
	}
);

function Switch({
	className,
	thumbClassName,
	color,
	size,
	...props
}: Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, 'color'> &
	VariantProps<typeof switchVariants> & {
		thumbClassName?: string;
	}) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			data-size={size ?? 'default'}
			className={cn(switchVariants({ color, size }), className)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					'pointer-events-none block size-[calc(var(--switch-h)-6px)] rounded-full bg-white shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[calc(var(--switch-w)-var(--switch-h)+2px)] data-[state=unchecked]:translate-x-0.5',
					thumbClassName
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch, switchVariants };
