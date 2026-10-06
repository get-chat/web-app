import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import CheckIcon from '@src/components/icons/Check';
import RemoveIcon from '@src/components/icons/Remove';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

/*
 * Replaces MUI's Checkbox. MUI's onChange(event) becomes
 * onCheckedChange(checked); `checked="indeterminate"` shows a dash. `color`
 * only sets the `--control` hue used when checked.
 */
const checkboxVariants = cva(
	'peer shrink-0 rounded-[4px] border-[1.5px] border-[#aeb7bf] bg-background transition-[background-color,border-color,box-shadow] outline-none! focus-visible:ring-[3px] focus-visible:ring-(--control)/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-[state=checked]:border-(--control) data-[state=checked]:bg-(--control) data-[state=indeterminate]:border-(--control) data-[state=indeterminate]:bg-(--control) [&_svg]:text-white!',
	{
		variants: {
			color: {
				primary: '[--control:var(--primary)]',
				secondary: '[--control:var(--color-secondary)]',
				destructive: '[--control:var(--destructive)]',
				success: '[--control:#2e7d32]',
				selection: '[--control:var(--selection)]',
			},
			size: {
				sm: 'size-4 [&_svg]:size-3!',
				default: 'size-[18px] [&_svg]:size-3.5!',
				lg: 'size-5 [&_svg]:size-4!',
			},
		},
		defaultVariants: {
			color: 'primary',
			size: 'default',
		},
	}
);

function Checkbox({
	className,
	color,
	size,
	...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, 'color'> &
	VariantProps<typeof checkboxVariants>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(checkboxVariants({ color, size }), className)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="group/indicator grid place-content-center transition-none"
			>
				<CheckIcon className="group-data-[state=indeterminate]/indicator:hidden!" />
				<RemoveIcon className="hidden! group-data-[state=indeterminate]/indicator:block!" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox, checkboxVariants };
