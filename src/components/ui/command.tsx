import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import SearchIcon from '@src/components/icons/Search';
import { cn } from '@src/lib/utils';

/*
 * shadcn's Command (cmdk): a list with type-to-filter and arrow-key
 * navigation, for pickers that can grow long (inboxes). Rows look like
 * dropdown-menu.tsx's: a light grey wash on the highlighted row, muted 19px
 * icons. Put it in a PopoverContent with p-0 for a combobox, or inline.
 */

function Command({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive>) {
	return (
		<CommandPrimitive
			data-slot="command"
			className={cn(
				'flex size-full flex-col overflow-hidden text-popover-foreground outline-none!',
				className
			)}
			{...props}
		/>
	);
}

function CommandInput({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
	return (
		<div
			data-slot="command-input-wrapper"
			className="flex h-11 items-center gap-2.5 border-b border-menu-divider px-4"
		>
			<SearchIcon className="size-[19px]! shrink-0 text-menu-icon!" />
			<CommandPrimitive.Input
				data-slot="command-input"
				className={cn(
					'h-full w-full min-w-0 border-0 bg-transparent p-0 text-sm text-inherit outline-none! placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				{...props}
			/>
		</div>
	);
}

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn(
				'max-h-80 scroll-py-1.5 overflow-x-hidden overflow-y-auto outline-none!',
				className
			)}
			{...props}
		/>
	);
}

function CommandEmpty({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className={cn('py-6 text-center text-sm text-menu-muted', className)}
			{...props}
		/>
	);
}

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn(
				'overflow-hidden py-1.5 [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pt-1 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-menu-muted',
				className
			)}
			{...props}
		/>
	);
}

function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			className={cn('h-px bg-menu-divider', className)}
			{...props}
		/>
	);
}

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				"relative flex min-h-8 cursor-pointer items-center gap-3.5 px-4 text-sm outline-none! select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[selected=true]:bg-menu-hover [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-menu-icon! [&_svg:not([class*='size-'])]:size-[19px]!",
				className
			)}
			{...props}
		/>
	);
}

export {
	Command,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandSeparator,
};
