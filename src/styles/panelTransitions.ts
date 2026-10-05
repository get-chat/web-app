import React from 'react';
import { css } from 'styled-components';

/**
 * Enter/exit transitions for the inbox side panels. Exit animations pair
 * with useUnmountTransition, which keeps the panel mounted until the
 * exit animation ends; "forwards" holds the final frame until unmount.
 */

/** Props a panel component forwards to its animated root element. */
export interface PanelTransitionProps {
	isExiting?: boolean;
	onAnimationEnd?: React.AnimationEventHandler<HTMLElement>;
}

export interface PanelTransitionStyleProps {
	$isExiting?: boolean;
}

/*
 * Put the returned classes on the panel's root; the keyframes live in
 * tailwind.css. Without motion (prefers-reduced-motion) there is no
 * animation; useUnmountTransition then unmounts after its fallback delay.
 */

/** Panels over the sidebar (contacts, profile...) slide in from the left */
export const overlayPanelAnimation = (isExiting?: boolean) =>
	isExiting
		? 'pointer-events-none motion-safe:animate-slide-out-left'
		: 'motion-safe:animate-slide-in-left';

/**
 * Side panels next to the chat (contact details, search...) grow into place;
 * on phones, where they cover the chat, they slide in from the right
 */
export const sidePanelAnimation = (isExiting?: boolean) =>
	isExiting
		? 'pointer-events-none motion-safe:animate-side-panel-out motion-safe:max-md:animate-slide-out-right'
		: 'motion-safe:animate-side-panel-in motion-safe:max-md:animate-slide-in-right';

/* Panels above the chat footer (templates, saved responses, interactive
messages) currently appear and disappear without animation, by choice.
All the wiring is still in place. To animate them again:
1. Add enter/exit classes like the ones above — see
   overlayPanelAnimation for the pattern. The exit animation is
   required, because useUnmountTransition unmounts on animationend.
2. Flip { isEnabled: false } to true on the three useUnmountTransition
   calls in ChatView.tsx. */
export const footerPanelTransition = css<PanelTransitionStyleProps>``;
