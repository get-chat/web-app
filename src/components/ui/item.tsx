import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import { Slot } from 'radix-ui';

import { Separator } from '@src/components/ui/separator';

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			role="list"
			data-slot="item-group"
			className={cn('group/item-group flex flex-col', className)}
			{...props}
		/>
	);
}

function ItemSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="item-separator"
			orientation="horizontal"
			className={cn('my-0', className)}
			{...props}
		/>
	);
}

/*
 * Replaces MUI's ListItem / ListItemButton / ListItemIcon / ListItemText:
 * Item (clickable: `asChild` around a <button> or <a>), ItemMedia, and
 * ItemContent with ItemTitle / ItemDescription. MUI's `selected` → the
 * `data-selected` attribute.
 */
const itemVariants = cva(
	'group/item flex flex-wrap items-center rounded-md border border-transparent text-left text-sm transition-colors duration-100 outline-none! focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[selected=true]:bg-menu-active [a&,button&]:cursor-pointer [a&,button&]:hover:bg-menu-hover',
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				outline: 'border-border',
				muted: 'bg-muted/50',
			},
			size: {
				default: 'gap-4 p-4',
				sm: 'gap-2.5 px-4 py-3',
				// MUI's dense list rows
				xs: 'gap-3 px-4 py-2',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

function Item({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'div'> &
	VariantProps<typeof itemVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : 'div';
	return (
		<Comp
			data-slot="item"
			data-variant={variant}
			data-size={size}
			className={cn(itemVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

const itemMediaVariants = cva(
	'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none',
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				icon: "size-8 rounded-sm border bg-muted [&_svg:not([class*='size-'])]:size-4",
				image:
					'size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

function ItemMedia({
	className,
	variant = 'default',
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
	return (
		<div
			data-slot="item-media"
			data-variant={variant}
			className={cn(itemMediaVariants({ variant, className }))}
			{...props}
		/>
	);
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="item-content"
			className={cn(
				'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
				className
			)}
			{...props}
		/>
	);
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="item-title"
			className={cn(
				'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
				className
			)}
			{...props}
		/>
	);
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot="item-description"
			className={cn(
				'line-clamp-2 text-sm leading-normal font-normal text-balance text-muted-foreground',
				'[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
				className
			)}
			{...props}
		/>
	);
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="item-actions"
			className={cn('flex items-center gap-2', className)}
			{...props}
		/>
	);
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="item-header"
			className={cn(
				'flex basis-full items-center justify-between gap-2',
				className
			)}
			{...props}
		/>
	);
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="item-footer"
			className={cn(
				'flex basis-full items-center justify-between gap-2',
				className
			)}
			{...props}
		/>
	);
}

export {
	Item,
	ItemMedia,
	ItemContent,
	ItemActions,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
	ItemDescription,
	ItemHeader,
	ItemFooter,
};
