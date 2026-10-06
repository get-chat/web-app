/**
 * MUI's Zoom transition, for an element that stays mounted: it grows from
 * nothing when shown (225ms) and shrinks away before hiding (195ms). While
 * hidden it is invisible, so it can't be clicked or focused; `visibility`
 * transitions too, which keeps it visible until the shrink has finished.
 */
export const zoomTransition = (isIn: boolean) =>
	'transition-[scale,visibility] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ' +
	(isIn ? 'visible scale-100 duration-225' : 'invisible scale-0 duration-195');
