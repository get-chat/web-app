import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import { Slot } from 'radix-ui';
import { Spinner } from '@src/components/ui/spinner';

/*
 * Replaces MUI's Button, IconButton, ButtonBase and Link.
 *
 * `variant` is the shape and `color` the hue, like MUI's own two props, so any
 * pair works. Each colour only sets `--btn` (the hue) and `--btn-fg` (text on a
 * solid fill), and the variants paint with those two variables: to add a
 * colour, add one line under `color`. MUI → here:
 *   contained → solid, outlined → outline, text → ghost, IconButton → ghost
 *   with an `icon*` size, ButtonBase → unstyled + size "none", Link → link
 *   color="error" → destructive, color="black" → neutral
 *
 * Typography and padding live in `size`, so `size="none"` leaves a bare
 * clickable element.
 */
const buttonVariants = cva(
	"relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap outline-none! transition-[color,background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] select-none focus-visible:ring-[3px] focus-visible:ring-(--btn)/30 disabled:pointer-events-none disabled:opacity-40 aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				solid: 'bg-(--btn) text-(color:--btn-fg) hover:bg-(--btn)/90',
				soft: 'bg-(--btn)/12 text-(color:--btn) hover:bg-(--btn)/20',
				outline:
					'border border-(--btn)/40 text-(color:--btn) hover:border-(--btn) hover:bg-(--btn)/6',
				ghost:
					'text-(color:--btn) hover:bg-(--btn)/6 focus-visible:bg-(--btn)/12 focus-visible:ring-0',
				link: 'text-(color:--btn) underline-offset-4 hover:underline',
				unstyled: '',
			},
			color: {
				primary: '[--btn:var(--primary)] [--btn-fg:var(--primary-foreground)]',
				// The app's secondary brand colour, as in MUI's theme
				secondary: '[--btn:var(--color-secondary)] [--btn-fg:#fff]',
				destructive: '[--btn:var(--destructive)] [--btn-fg:#fff]',
				neutral: '[--btn:var(--foreground)] [--btn-fg:#fff]',
			},
			size: {
				default:
					'h-9 gap-2 rounded-md px-4 text-sm font-medium has-[>svg]:px-3',
				xs: "h-6 gap-1 rounded-md px-2 text-xs font-medium has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: 'h-8 gap-1.5 rounded-md px-3 text-sm font-medium has-[>svg]:px-2.5',
				lg: 'h-10 gap-2 rounded-md px-6 text-sm font-medium has-[>svg]:px-4',
				icon: 'size-9 rounded-md',
				'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8 rounded-md',
				'icon-lg': 'size-10 rounded-md',
				// MUI's large IconButton: 48px circle around a 24px icon
				'icon-xl': "size-12 rounded-full [&_svg:not([class*='size-'])]:size-6",
				none: '',
			},
		},
		compoundVariants: [
			// A link is text in a sentence, not a box
			{ variant: 'link', className: 'h-auto px-0 has-[>svg]:px-0' },
		],
		defaultVariants: {
			variant: 'solid',
			color: 'primary',
			size: 'default',
		},
	}
);

function Button({
	className,
	variant = 'solid',
	color = 'primary',
	size = 'default',
	asChild = false,
	loading = false,
	disabled,
	children,
	...props
}: Omit<React.ComponentProps<'button'>, 'color'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		/** Shows a spinner before the label and disables the button */
		loading?: boolean;
	}) {
	const sharedProps = {
		'data-slot': 'button',
		'data-variant': variant,
		'data-color': color,
		'data-size': size,
		className: cn(buttonVariants({ variant, color, size, className })),
	};

	if (asChild) {
		return (
			<Slot.Root {...sharedProps} {...props}>
				{children}
			</Slot.Root>
		);
	}

	return (
		<button
			// Like MUI's ButtonBase: a button in a form doesn't submit it
			// unless it says type="submit"
			type="button"
			{...sharedProps}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			{loading && <Spinner />}
			{children}
		</button>
	);
}

export { Button, buttonVariants };
