import * as React from 'react';
import CheckCircleOutlineIcon from '@src/components/icons/CheckCircle';
import ErrorOutlineIcon from '@src/components/icons/Error';
import InfoOutlinedIcon from '@src/components/icons/Info';
import ReportProblemOutlinedIcon from '@src/components/icons/Warning';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { Spinner } from '@src/components/ui/spinner';

/*
 * Replaces MUI's Snackbar. <Toaster /> is mounted once in App.tsx; show a
 * message from anywhere with `toast('Saved')` or `toast.error(...)` from
 * 'sonner'. Snackbar's autoHideDuration → `duration`, anchorOrigin → this
 * Toaster's `position`.
 */
const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			className="toaster group"
			icons={{
				success: <CheckCircleOutlineIcon className="size-[18px]!" />,
				info: <InfoOutlinedIcon className="size-[18px]!" />,
				warning: <ReportProblemOutlinedIcon className="size-[18px]!" />,
				error: <ErrorOutlineIcon className="size-[18px]!" />,
				loading: <Spinner />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--border-radius': 'var(--radius)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
