import { useRef } from 'react';

// MUI Popover's marginThreshold: how close to the viewport edge it may go
const VIEWPORT_MARGIN = 16;

/** The soft shadow of the popovers shown over a message */
export const overMessageShadowClassName =
	'shadow-[0_4px_10px_-6px_rgba(0,0,45,0.4)]';

const clamp = (start: number, size: number, viewportSize: number) =>
	Math.max(
		VIEWPORT_MARGIN,
		Math.min(start, viewportSize - VIEWPORT_MARGIN - size)
	);

/**
 * Centers a Popover over `anchorElement` and keeps it inside the viewport, like
 * MUI's Menu with anchorOrigin and transformOrigin both at center/center.
 * Pass `virtualRef` to PopoverAnchor, and `contentRef` plus `contentProps` to
 * PopoverContent. The anchor is kept after closing, so the exit animation
 * stays in place.
 */
export function useCenteredOverAnchor(anchorElement: HTMLElement | undefined) {
	const lastAnchor = useRef<HTMLElement>();
	if (anchorElement) lastAnchor.current = anchorElement;

	const contentRef = useRef<HTMLDivElement>(null);

	// Radix asks for the anchor's box on every reposition (scroll, resize, the
	// content resizing), so measure everything here. The box returned is the
	// content's top-left corner, which `contentProps` attaches the content to.
	const virtualRef = useRef({
		getBoundingClientRect: () => {
			const anchorRect =
				lastAnchor.current?.getBoundingClientRect() ?? new DOMRect();
			const width = contentRef.current?.offsetWidth ?? 0;
			const height = contentRef.current?.offsetHeight ?? 0;

			return new DOMRect(
				clamp(
					anchorRect.left + anchorRect.width / 2 - width / 2,
					width,
					window.innerWidth
				),
				clamp(
					anchorRect.top + anchorRect.height / 2 - height / 2,
					height,
					window.innerHeight
				),
				0,
				0
			);
		},
	});

	return {
		virtualRef,
		contentRef,
		contentProps: {
			side: 'bottom',
			align: 'start',
			sideOffset: 0,
			avoidCollisions: false,
			// Grow from the middle, as MUI's did, and stay within the viewport
			// margins
			className:
				'origin-center max-h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)]',
		},
	} as const;
}
