import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, stopEscape } from '@src/lib/utils';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { Button } from '@src/components/ui/button';

/*
 * Replaces MUI's Dialog. The parts carry their own padding like MUI's, so
 * DialogTitle → DialogHeader + DialogTitle, DialogContent → DialogBody (the
 * part that scrolls), DialogContentText → DialogDescription and DialogActions →
 * DialogFooter. MUI's `onClose` becomes `onOpenChange`, `maxWidth` becomes
 * `size` on DialogContent with the same names and widths (default "sm", like
 * MUI's), `fullScreen` becomes size="full", and `fullWidth` is the default.
 * There is no close (X) button unless `showCloseButton` is set, as in MUI.
 *
 * z-[1300] is MUI's modal layer. Paddings and type sizes are the app's own,
 * from its former global MUI overrides.
 */
const dialogContentVariants = cva(
	'fixed top-[50%] left-[50%] z-[1300] flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
	{
		variants: {
			size: {
				xs: 'sm:max-w-[444px]',
				sm: 'sm:max-w-[600px]',
				md: 'sm:max-w-[900px]',
				lg: 'sm:max-w-[1200px]',
				xl: 'sm:max-w-[1536px]',
				full: 'h-dvh max-h-none max-w-none rounded-none',
			},
		},
		defaultVariants: {
			size: 'sm',
		},
	}
);

function Dialog({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				'fixed inset-0 z-[1300] bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
				className
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	overlayClassName,
	size,
	children,
	showCloseButton = false,
	onKeyDown,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> &
	VariantProps<typeof dialogContentVariants> & {
		overlayClassName?: string;
		showCloseButton?: boolean;
	}) {
	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay className={overlayClassName} />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				data-size={size ?? 'sm'}
				className={cn(dialogContentVariants({ size }), className)}
				onKeyDown={stopEscape(onKeyDown)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close asChild>
						<Button
							data-slot="dialog-close"
							variant="ghost"
							color="neutral"
							size="icon-sm"
							className="absolute top-3 right-3 text-muted-foreground"
						>
							<CloseIcon />
							<span className="sr-only">Close</span>
						</Button>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="dialog-header"
			className={cn(
				'flex shrink-0 flex-col gap-1.5 px-5 pt-[15px] pb-2.5 text-left max-[750px]:px-[15px]',
				className
			)}
			{...props}
		/>
	);
}

/** The scrolling middle of a dialog, like MUI's DialogContent */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="dialog-body"
			className={cn(
				'min-h-0 flex-1 overflow-y-auto px-5 py-[5px] max-[750px]:px-[15px]',
				className
			)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<'div'> & {
	showCloseButton?: boolean;
}) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				'flex shrink-0 flex-col-reverse gap-2 p-2.5 sm:flex-row sm:justify-end',
				className
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close asChild>
					<Button variant="outline" color="neutral">
						Close
					</Button>
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn(
				'pr-8 text-lg leading-snug font-semibold max-[750px]:text-base',
				className
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn('text-[15px] text-muted-foreground', className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
	dialogContentVariants,
};
