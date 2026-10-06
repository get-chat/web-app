import * as React from 'react';
import { cn } from '@src/lib/utils';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

// Styled and timed after MUI's Tooltip, which the rest of the app still uses

const TOUCH_ENTER_DELAY = 700;
const TOUCH_LEAVE_DELAY = 1500;

interface TooltipTouch {
	isOpenedByTouch: boolean;
	onTouchStart: () => void;
	onTouchEnd: () => void;
}

const TooltipTouchContext = React.createContext<TooltipTouch | null>(null);

function TooltipProvider({
	delayDuration = 100,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
	return (
		<TooltipPrimitive.Provider
			data-slot="tooltip-provider"
			delayDuration={delayDuration}
			{...props}
		/>
	);
}

function Tooltip({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
	const [isOpenedByTouch, setOpenedByTouch] = React.useState(false);
	const timer = React.useRef<number>();
	const open = openProp ?? uncontrolledOpen;

	React.useEffect(() => () => window.clearTimeout(timer.current), []);

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (openProp === undefined) setUncontrolledOpen(next);
			onOpenChange?.(next);
		},
		[openProp, onOpenChange]
	);

	// Radix tooltips ignore touch on purpose. MUI's open on a long press and
	// stay up for a moment after the finger lifts, so do the same here.
	const touch = React.useMemo<TooltipTouch>(
		() => ({
			isOpenedByTouch,
			onTouchStart: () => {
				window.clearTimeout(timer.current);
				timer.current = window.setTimeout(() => {
					setOpenedByTouch(true);
					setOpen(true);
				}, TOUCH_ENTER_DELAY);
			},
			onTouchEnd: () => {
				window.clearTimeout(timer.current);
				if (!isOpenedByTouch) return;
				timer.current = window.setTimeout(() => {
					setOpenedByTouch(false);
					setOpen(false);
				}, TOUCH_LEAVE_DELAY);
			},
		}),
		[isOpenedByTouch, setOpen]
	);

	return (
		<TooltipTouchContext.Provider value={touch}>
			<TooltipPrimitive.Root
				data-slot="tooltip"
				open={open}
				// While opened by touch, the leave delay above decides when to close
				onOpenChange={(next) => !isOpenedByTouch && setOpen(next)}
				{...props}
			/>
		</TooltipTouchContext.Provider>
	);
}

function isFocusVisible(element: Element) {
	try {
		return element.matches(':focus-visible');
	} catch {
		// Environments without :focus-visible support (jsdom)
		return true;
	}
}

function TooltipTrigger({
	onTouchStart,
	onTouchEnd,
	onFocus,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
	const touch = React.useContext(TooltipTouchContext);

	return (
		<TooltipPrimitive.Trigger
			data-slot="tooltip-trigger"
			// Like MUI, open on keyboard focus only: not when focus comes back to
			// a menu's trigger after the menu closes, or from a click
			onFocus={(event) => {
				onFocus?.(event);
				if (!isFocusVisible(event.currentTarget)) event.preventDefault();
			}}
			onTouchStart={(event) => {
				onTouchStart?.(event);
				touch?.onTouchStart();
			}}
			onTouchEnd={(event) => {
				onTouchEnd?.(event);
				touch?.onTouchEnd();
			}}
			{...props}
		/>
	);
}

function TooltipContent({
	className,
	side = 'bottom',
	sideOffset,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
	const isOpenedByTouch =
		React.useContext(TooltipTouchContext)?.isOpenedByTouch ?? false;

	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-slot="tooltip-content"
				data-touch={isOpenedByTouch || undefined}
				side={side}
				sideOffset={sideOffset ?? (isOpenedByTouch ? 24 : 14)}
				className={cn(
					'z-[1500] max-w-[300px] origin-(--radix-tooltip-content-transform-origin) animate-grow-in rounded-[4px] bg-[rgba(97,97,97,0.92)] px-2 py-1 text-[11px] leading-[1.4em] font-medium break-words text-white data-[state=closed]:animate-grow-out data-[touch]:px-4 data-[touch]:py-2 data-[touch]:text-sm data-[touch]:leading-[calc(32/14)]',
					className
				)}
				{...props}
			>
				{children}
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
}

/**
 * MUI's `<Tooltip title={...}>` in one piece: wraps `children` (which must
 * accept a ref, like a DOM element) and shows nothing when `title` is empty,
 * as MUI does. placement → `side` + `align`, disableInteractive →
 * disableHoverableContent.
 */
function SimpleTooltip({
	title,
	side,
	align,
	contentClassName,
	children,
	...props
}: Omit<React.ComponentProps<typeof Tooltip>, 'children'> & {
	title: React.ReactNode;
	side?: React.ComponentProps<typeof TooltipContent>['side'];
	align?: React.ComponentProps<typeof TooltipContent>['align'];
	contentClassName?: string;
	children: React.ReactElement;
}) {
	if (
		title === undefined ||
		title === null ||
		title === '' ||
		title === false
	) {
		return children;
	}

	return (
		<Tooltip {...props}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side} align={align} className={contentClassName}>
				{title}
			</TooltipContent>
		</Tooltip>
	);
}

export {
	SimpleTooltip,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
};
