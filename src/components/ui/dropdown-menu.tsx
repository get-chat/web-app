import * as React from 'react';
import { cn } from '@src/lib/utils';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';

// Styled after the menus of the Inbox Analytics design: a borderless white
// panel with a soft shadow, 32px rows with a muted 19px icon, and only a light
// grey wash on the highlighted row. z-[1300] is MUI's modal layer, which keeps
// menus above MUI dialogs and drawers.
const menuSurface =
	'z-[1300] min-w-48 overflow-x-hidden overflow-y-auto rounded-[12px] bg-popover py-1.5 text-popover-foreground shadow-menu data-[state=closed]:animate-menu-out data-[state=open]:animate-menu-in';

// `!` on the icon colour: App.css colours every MUI icon grey. Icons that set
// their own text colour keep it.
const menuItem =
	"relative flex h-8 cursor-pointer items-center gap-3.5 px-4 text-sm outline-none! select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-menu-hover data-[inset]:pl-[49px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-menu-icon! [&_svg:not([class*='size-'])]:size-[19px]!";

function DropdownMenu({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
	return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
	return (
		<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
	);
}

function DropdownMenuTrigger({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
	return (
		<DropdownMenuPrimitive.Trigger
			data-slot="dropdown-menu-trigger"
			{...props}
		/>
	);
}

function DropdownMenuContent({
	className,
	sideOffset = 6,
	collisionPadding = 16,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				data-slot="dropdown-menu-content"
				sideOffset={sideOffset}
				collisionPadding={collisionPadding}
				className={cn(
					menuSurface,
					'max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)',
					className
				)}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
}

function DropdownMenuGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
	return (
		<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
	);
}

function DropdownMenuItem({
	className,
	inset,
	variant = 'default',
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean;
	variant?: 'default' | 'destructive';
}) {
	return (
		<DropdownMenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				menuItem,
				"data-[variant=destructive]:text-destructive data-[variant=destructive]:[&_svg:not([class*='text-'])]:text-destructive!",
				className
			)}
			{...props}
		/>
	);
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			className={cn(menuItem, 'group/checkbox', className)}
			checked={checked}
			{...props}
		>
			<span className="flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-[#aeb7bf] bg-white group-data-[state=checked]/checkbox:border-selection group-data-[state=checked]/checkbox:bg-selection">
				<DropdownMenuPrimitive.ItemIndicator>
					<CheckIcon className="size-3.5! text-white!" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	);
}

function DropdownMenuRadioGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
	return (
		<DropdownMenuPrimitive.RadioGroup
			data-slot="dropdown-menu-radio-group"
			{...props}
		/>
	);
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
	return (
		<DropdownMenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			className={cn(menuItem, 'group/radio', className)}
			{...props}
		>
			<RadioButtonCheckedIcon className="hidden! text-selection! group-data-[state=checked]/radio:block!" />
			<RadioButtonUncheckedIcon className="text-[#8696a0]! group-data-[state=checked]/radio:hidden!" />
			{children}
		</DropdownMenuPrimitive.RadioItem>
	);
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.Label
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(
				'px-4 pt-2 pb-1 text-xs font-medium text-menu-muted data-[inset]:pl-[49px]',
				className
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			data-slot="dropdown-menu-separator"
			className={cn('my-1.5 h-px bg-menu-divider', className)}
			{...props}
		/>
	);
}

function DropdownMenuShortcut({
	className,
	...props
}: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			className={cn('ml-auto pl-4 text-xs text-menu-muted', className)}
			{...props}
		/>
	);
}

function DropdownMenuSub({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
	return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.SubTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(menuItem, 'data-[state=open]:bg-menu-active', className)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto" />
		</DropdownMenuPrimitive.SubTrigger>
	);
}

function DropdownMenuSubContent({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
	return (
		<DropdownMenuPrimitive.SubContent
			data-slot="dropdown-menu-sub-content"
			className={cn(
				menuSurface,
				'origin-(--radix-dropdown-menu-content-transform-origin)',
				className
			)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuPortal,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
};
