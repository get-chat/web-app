import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@src/lib/utils';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Button } from '@src/components/ui/button';

/*
 * Replaces MUI's Alert and AlertTitle, with the same `severity`, `icon`,
 * `action` and `onClose` props. `severity` only sets the `--alert` hue, which
 * `variant` paints: to add a severity, add one line under `severity`.
 * MUI's variant="standard" is "soft" here.
 */
const alertVariants = cva(
	'relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm',
	{
		variants: {
			severity: {
				info: '[--alert:#0288d1]',
				success: '[--alert:#2e7d32]',
				warning: '[--alert:#ed6c02]',
				error: '[--alert:var(--destructive)]',
				neutral: '[--alert:var(--muted-foreground)]',
			},
			variant: {
				soft: 'border-(--alert)/20 bg-(--alert)/8 text-foreground [&_[data-slot=alert-icon]_svg]:text-(color:--alert)!',
				outline:
					'border-(--alert)/50 bg-background text-foreground [&_[data-slot=alert-icon]_svg]:text-(color:--alert)!',
				filled:
					'border-transparent bg-(--alert) text-white [&_svg]:text-white! [&_[data-slot=alert-description]]:text-white/90',
			},
		},
		defaultVariants: {
			severity: 'info',
			variant: 'soft',
		},
	}
);

const defaultIcons = {
	info: <InfoOutlinedIcon />,
	success: <CheckCircleOutlineIcon />,
	warning: <ReportProblemOutlinedIcon />,
	error: <ErrorOutlineIcon />,
	neutral: <InfoOutlinedIcon />,
};

function Alert({
	className,
	severity,
	variant,
	icon,
	action,
	onClose,
	children,
	...props
}: React.ComponentProps<'div'> &
	VariantProps<typeof alertVariants> & {
		/** Replaces the severity's icon; `false` hides it */
		icon?: React.ReactNode | false;
		/** Shown at the end, e.g. a button */
		action?: React.ReactNode;
		/** Adds a close button, like MUI's */
		onClose?: () => void;
	}) {
	const shownIcon =
		icon === undefined ? defaultIcons[severity ?? 'info'] : icon;

	return (
		<div
			data-slot="alert"
			data-severity={severity ?? 'info'}
			role="alert"
			className={cn(alertVariants({ severity, variant }), className)}
			{...props}
		>
			{shownIcon !== false && (
				<span
					data-slot="alert-icon"
					className="flex shrink-0 py-px [&_svg:not([class*='size-'])]:size-5!"
				>
					{shownIcon}
				</span>
			)}
			<div
				data-slot="alert-content"
				className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5"
			>
				{children}
			</div>
			{(action || onClose) && (
				<div
					data-slot="alert-action"
					className="-my-1 -mr-2 flex shrink-0 items-center gap-1"
				>
					{action}
					{onClose && (
						<Button
							variant="ghost"
							color="neutral"
							size="icon-sm"
							className="text-current"
							onClick={onClose}
						>
							<CloseIcon className="size-[18px]! text-current!" />
							<span className="sr-only">Close</span>
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="alert-title"
			className={cn('font-semibold tracking-tight', className)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				'grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed',
				className
			)}
			{...props}
		/>
	);
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
