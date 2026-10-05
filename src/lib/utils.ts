import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * MUI's modals stopped Escape at their root, so the app's own document-level
 * Escape listeners (closing side panels...) don't also fire. Handlers inside
 * still see the key first.
 */
function stopEscape<T extends HTMLElement>(
	onKeyDown?: React.KeyboardEventHandler<T>
): React.KeyboardEventHandler<T> {
	return (event) => {
		onKeyDown?.(event);
		if (event.key === 'Escape') event.stopPropagation();
	};
}

export { stopEscape };
