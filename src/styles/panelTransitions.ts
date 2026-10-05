import React from 'react';
import { css, keyframes } from 'styled-components';

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
 * Tailwind versions of the transitions below, for panels styled with
 * classes: put the returned classes on the panel's root. Without motion
 * (prefers-reduced-motion) there is no animation; useUnmountTransition then
 * unmounts after its fallback delay.
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

/* Side panels (ContactDetails, SearchMessage, MessageStatuses) are flex
siblings of the sidebar and chat view; animating flex-grow lets the
neighbors reflow smoothly instead of snapping to their new widths. The
flex-grow endpoints must match the panels' static "flex: 0.4 1". Content
stays transparent while the panel is narrow so text doesn't visibly
rewrap. */
const sidePanelExpand = keyframes`
	0% {
		flex-grow: 0.001;
		opacity: 0;
	}
	40% {
		opacity: 0;
	}
	100% {
		flex-grow: 0.4;
		opacity: 1;
	}
`;

const sidePanelCollapse = keyframes`
	0% {
		flex-grow: 0.4;
		opacity: 1;
	}
	60% {
		opacity: 0;
	}
	100% {
		flex-grow: 0.001;
		opacity: 0;
	}
`;

/* Panels that overlay the sidebar (contacts, profile) enter from the
left; full-screen detail panels on mobile enter from the right. */
const slideInLeft = keyframes`
	from {
		transform: translateX(-24px);
		opacity: 0;
	}
	to {
		transform: none;
		opacity: 1;
	}
`;

const slideOutLeft = keyframes`
	from {
		transform: none;
		opacity: 1;
	}
	to {
		transform: translateX(-24px);
		opacity: 0;
	}
`;

const slideInRight = keyframes`
	from {
		transform: translateX(24px);
		opacity: 0;
	}
	to {
		transform: none;
		opacity: 1;
	}
`;

const slideOutRight = keyframes`
	from {
		transform: none;
		opacity: 1;
	}
	to {
		transform: translateX(24px);
		opacity: 0;
	}
`;

const exitingPointerEvents = css<PanelTransitionStyleProps>`
	${({ $isExiting }) => $isExiting && 'pointer-events: none;'}
`;

export const sidePanelTransition = css<PanelTransitionStyleProps>`
	animation: ${({ $isExiting }) =>
		$isExiting
			? css`
					${sidePanelCollapse} 0.25s ease-in forwards
			  `
			: css`
					${sidePanelExpand} 0.3s ease-out
			  `};
	${exitingPointerEvents}

	@media only screen and (max-width: 750px) {
		animation: ${({ $isExiting }) =>
			$isExiting
				? css`
						${slideOutRight} 0.2s ease-in forwards
				  `
				: css`
						${slideInRight} 0.25s ease-out
				  `};
	}

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`;

/* Panels above the chat footer (templates, saved responses, interactive
messages) currently appear and disappear without animation, by choice.
All the wiring is still in place. To animate them again:
1. Add enter/exit keyframes and an animation rule here — see
   overlayPanelTransition for the pattern. The exit animation is
   required, because useUnmountTransition unmounts on animationend.
2. Flip { isEnabled: false } to true on the three useUnmountTransition
   calls in ChatView.tsx. */
export const footerPanelTransition = css<PanelTransitionStyleProps>``;

export const overlayPanelTransition = css<PanelTransitionStyleProps>`
	animation: ${({ $isExiting }) =>
		$isExiting
			? css`
					${slideOutLeft} 0.2s ease-in forwards
			  `
			: css`
					${slideInLeft} 0.25s ease-out
			  `};
	${exitingPointerEvents}

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`;
