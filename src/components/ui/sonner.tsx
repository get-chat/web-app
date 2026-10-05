import * as React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
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
