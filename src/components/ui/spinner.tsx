import * as React from 'react';
import { cn } from '@src/lib/utils';

/**
 * Indeterminate loading indicator, in place of MUI's CircularProgress. It takes
 * the current text colour; `size` works like MUI's (a number is pixels), or
 * size it with a `size-*` class. Style the track with `[&_circle]:...`.
 */
function Spinner({
	className,
	size,
	style,
	...props
}: React.ComponentProps<'svg'> & { size?: number | string }) {
	return (
		<svg
			data-slot="spinner"
			role="status"
			aria-label="Loading"
			viewBox="0 0 24 24"
			fill="none"
			className={cn('size-4 shrink-0 animate-spin', className)}
			style={
				size === undefined ? style : { width: size, height: size, ...style }
			}
			{...props}
		>
			<circle
				cx="12"
				cy="12"
				r="9.5"
				stroke="currentColor"
				strokeOpacity="0.2"
				strokeWidth="3"
			/>
			<path
				d="M21.5 12A9.5 9.5 0 0 0 12 2.5"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export { Spinner };
