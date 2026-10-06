import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Our own theme values (tailwind.css) that tailwind-merge can't know about;
// without them, e.g. shadow-menu and shadow-[…] would both be kept
const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			shadow: ['menu'],
		},
	},
});

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
