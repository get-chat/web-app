import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, stopEscape } from '@src/lib/utils';
import CheckIcon from '@src/components/icons/Check';
import ExpandMoreIcon from '@src/components/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@src/components/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@src/components/icons/KeyboardArrowDown';
import { Select as SelectPrimitive } from 'radix-ui';
import { fieldSurfaceVariants } from '@src/components/ui/input';

/*
 * Replaces MUI's Select. Values are strings: MUI's onChange(event) becomes
 * onValueChange(value), MenuItem children become SelectItem, and the label is a
 * FieldLabel/Label pointing at the trigger's id. The trigger takes Input's
 * variants ("underline" is MUI's standard style); the list looks like
 * dropdown-menu.tsx.
 */
const selectTriggerVariants = cva(
	"flex w-fit items-center justify-between gap-2 py-2 text-sm whitespace-nowrap transition-[color,border-color,box-shadow] outline-none! disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5! [&_svg:not([class*='text-'])]:text-muted-foreground!",
	{
		variants: {
			variant: fieldSurfaceVariants,
			size: {
				sm: 'h-8',
				default: 'h-9',
				lg: 'h-10',
			},
		},
		defaultVariants: {
			variant: 'outline',
			size: 'default',
		},
	}
);

function Select({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
	className,
	variant,
	size,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> &
	VariantProps<typeof selectTriggerVariants>) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-variant={variant ?? 'outline'}
			data-size={size ?? 'default'}
			className={cn(selectTriggerVariants({ variant, size }), className)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ExpandMoreIcon />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = 'item-aligned',
	align = 'center',
	onKeyDown,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				className={cn(
					'relative z-[1300] max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-[12px] bg-popover text-popover-foreground shadow-menu data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
					position === 'popper' &&
						'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
					className
				)}
				position={position}
				align={align}
				onKeyDown={stopEscape(onKeyDown)}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						'py-1.5',
						position === 'popper' &&
							'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn(
				'px-4 pt-2 pb-1 text-xs font-medium text-menu-muted',
				className
			)}
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex h-8 w-full cursor-pointer items-center gap-3.5 pr-10 pl-4 text-sm outline-none! select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-menu-hover data-[state=checked]:font-medium [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-menu-icon! [&_svg:not([class*='size-'])]:size-[19px]! *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				className
			)}
			{...props}
		>
			<span
				data-slot="select-item-indicator"
				className="absolute right-4 flex items-center justify-center"
			>
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-[18px]! text-selection!" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn(
				'pointer-events-none my-1.5 h-px bg-menu-divider',
				className
			)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot="select-scroll-up-button"
			className={cn(
				'flex cursor-default items-center justify-center py-1',
				className
			)}
			{...props}
		>
			<KeyboardArrowUpIcon />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot="select-scroll-down-button"
			className={cn(
				'flex cursor-default items-center justify-center py-1',
				className
			)}
			{...props}
		>
			<KeyboardArrowDownIcon />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
	selectTriggerVariants,
};
