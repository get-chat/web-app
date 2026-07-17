import React, { useCallback, useEffect, useState } from 'react';

/**
 * Keeps a conditionally rendered component mounted while its exit
 * animation plays, unmounting on the animationend DOM event instead of
 * a timer so CSS stays the single source of truth for durations.
 *
 * Usage:
 *   const transition = useUnmountTransition(isVisible);
 *   {transition.isMounted && (
 *     <Panel
 *       isExiting={transition.isExiting}
 *       onAnimationEnd={transition.handleAnimationEnd}
 *     />
 *   )}
 * The component forwards both props to its animated root element.
 */
interface Options {
	/**
	 * Set to false for components whose exit animation is currently
	 * turned off in CSS: the component then unmounts immediately when
	 * hidden (animationend would never fire), while the render-site
	 * wiring stays in place so the animation can be re-enabled later.
	 */
	isEnabled?: boolean;
}

// Generously above every exit animation duration; only fires when
// animationend never arrives (e.g. the animation was cancelled by a
// mid-exit prefers-reduced-motion change or a display: none ancestor)
const UNMOUNT_FALLBACK_MS = 1000;

const useUnmountTransition = (isVisible: boolean, options?: Options) => {
	const isEnabled = options?.isEnabled ?? true;
	const [isMounted, setIsMounted] = useState(isVisible);

	useEffect(() => {
		if (isVisible) {
			setIsMounted(true);
		} else if (
			!isEnabled ||
			// Optional: not implemented in jsdom
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
		) {
			// No exit animation will play, so animationend never fires
			setIsMounted(false);
		} else {
			// Safety net: CSS stays the source of truth via animationend,
			// but a cancelled animation (reduced-motion flipped mid-exit,
			// hidden subtree) must not leave the component mounted forever
			const fallback = setTimeout(
				() => setIsMounted(false),
				UNMOUNT_FALLBACK_MS
			);
			return () => clearTimeout(fallback);
		}
	}, [isVisible, isEnabled]);

	const handleAnimationEnd = useCallback(
		(event: React.AnimationEvent<HTMLElement>) => {
			// Ignore animations bubbling up from children
			if (event.target === event.currentTarget && !isVisible) {
				setIsMounted(false);
			}
		},
		[isVisible]
	);

	return {
		isMounted: isEnabled ? isMounted : isVisible,
		isExiting: isEnabled && isMounted && !isVisible,
		handleAnimationEnd,
	};
};

export default useUnmountTransition;
