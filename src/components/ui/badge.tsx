import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import CancelIcon from '@src/components/icons/Cancel';
import { Slot } from 'radix-ui';

/*
 * Replaces MUI's Chip: `label` → children, `icon` → an icon child, `onDelete` →
 * the same prop, clickable → `asChild` around a <button>. Not MUI's Badge (the
 * count dot on a corner); for that, position a small Badge over the element.
 *
 * Like Button, `color` only sets `--badge`, which `variant` paints.
 */
const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-none! focus-visible:ring-[3px] focus-visible:ring-(--badge)/30 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1.15em]! [&_svg:not([class*='size-'])]:[font-size:inherit]! [a&,button&]:cursor-pointer",
	{
		variants: {
			variant: {
				solid:
					'bg-(--badge) text-(color:--badge-fg) [a&,button&]:hover:bg-(--badge)/90',
				soft: 'bg-(--badge)/12 text-(color:--badge) [a&,button&]:hover:bg-(--badge)/20',
				outline:
					'border-(--badge)/40 text-(color:--badge) [a&,button&]:hover:bg-(--badge)/6',
			},
			color: {
				primary:
					'[--badge:var(--primary)] [--badge-fg:var(--primary-foreground)]',
				secondary: '[--badge:var(--color-secondary)] [--badge-fg:#fff]',
				destructive: '[--badge:var(--destructive)] [--badge-fg:#fff]',
				neutral: '[--badge:var(--muted-foreground)] [--badge-fg:#fff]',
				selection: '[--badge:var(--selection)] [--badge-fg:#fff]',
			},
			size: {
				sm: 'h-5 px-1.5 text-[11px]',
				default: 'h-6 px-2.5 text-xs',
				// MUI's medium Chip: regular 13px text, the icon close to the edge
				lg: 'h-8 gap-1.5 px-3 text-[13px] font-normal has-[>svg:first-child]:pl-2.5',
			},
		},
		defaultVariants: {
			variant: 'soft',
			color: 'neutral',
			size: 'default',
		},
	}
);

function Badge({
	className,
	variant,
	color,
	size,
	asChild = false,
	onDelete,
	children,
	...props
}: Omit<React.ComponentProps<'span'>, 'color'> &
	VariantProps<typeof badgeVariants> & {
		asChild?: boolean;
		/** Adds a remove button at the end, like MUI Chip's */
		onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	}) {
	const Comp = asChild ? Slot.Root : 'span';

	return (
		<Comp
			data-slot="badge"
			data-variant={variant ?? 'soft'}
			className={cn(
				badgeVariants({ variant, color, size }),
				onDelete && 'pr-1',
				className
			)}
			{...props}
		>
			{asChild ? (
				children
			) : (
				<>
					{children}
					{onDelete && (
						<button
							type="button"
							data-slot="badge-delete"
							aria-label="Remove"
							onClick={onDelete}
							className="-my-1 flex cursor-pointer items-center rounded-full opacity-60 outline-none! hover:opacity-100 focus-visible:opacity-100 [&_svg]:text-current!"
						>
							<CancelIcon className="size-[18px]!" />
						</button>
					)}
				</>
			)}
		</Comp>
	);
}

export { Badge, badgeVariants };
