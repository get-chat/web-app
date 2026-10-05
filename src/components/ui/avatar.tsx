import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import { Avatar as AvatarPrimitive } from 'radix-ui';

/*
 * Replaces MUI's Avatar: put the image in AvatarImage and the initials (or an
 * icon) in AvatarFallback, which shows while the image loads or if it fails.
 * MUI's `variant` is `shape` here; `size` defaults to MUI's 40px.
 */
const avatarVariants = cva(
	'group/avatar relative flex shrink-0 overflow-hidden select-none',
	{
		variants: {
			size: {
				xs: 'size-6 text-[10px]',
				sm: 'size-8 text-xs',
				default: 'size-10 text-sm',
				lg: 'size-12 text-base',
				xl: 'size-14 text-lg',
			},
			shape: {
				circle: 'rounded-full',
				rounded: 'rounded-lg',
				square: 'rounded-none',
			},
		},
		defaultVariants: {
			size: 'default',
			shape: 'circle',
		},
	}
);

function Avatar({
	className,
	size,
	shape,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
	VariantProps<typeof avatarVariants>) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size ?? 'default'}
			className={cn(avatarVariants({ size, shape }), className)}
			{...props}
		/>
	);
}

function AvatarImage({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn('aspect-square size-full object-cover', className)}
			{...props}
		/>
	);
}

function AvatarFallback({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(
				"flex size-full items-center justify-center rounded-[inherit] bg-muted font-semibold text-muted-foreground [&_svg:not([class*='size-'])]:size-[60%]",
				className
			)}
			{...props}
		/>
	);
}

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot="avatar-badge"
			className={cn(
				'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
				'size-[25%] min-w-2 [&>svg]:size-[70%]',
				className
			)}
			{...props}
		/>
	);
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="avatar-group"
			className={cn(
				'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
				className
			)}
			{...props}
		/>
	);
}

function AvatarGroupCount({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="avatar-group-count"
			className={cn(
				'relative flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=xs]/avatar-group:size-6 group-has-data-[size=sm]/avatar-group:size-8 group-has-data-[size=lg]/avatar-group:size-12 group-has-data-[size=xl]/avatar-group:size-14',
				className
			)}
			{...props}
		/>
	);
}

export {
	Avatar,
	avatarVariants,
	AvatarImage,
	AvatarFallback,
	AvatarBadge,
	AvatarGroup,
	AvatarGroupCount,
};
