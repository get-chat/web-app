import React from 'react';
import { ArrowDownward } from '@src/components/icons';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';
import { zoomTransition } from '@src/styles/zoomTransition';

interface Props {
	isVisible: boolean;
	/** Messages that arrived while scrolled up, shown as a badge */
	newMessageCount: number;
	onClick: () => void;
}

/**
 * The round button that scrolls the chat back to the newest message, at the
 * bottom right of the message list. Place it in the chat body's positioning
 * box: it floats over the messages only, under the panels and overlays
 * around them.
 */
const ScrollToBottomButton: React.FC<Props> = ({
	isVisible,
	newMessageCount,
	onClick,
}) => (
	// Holds the button and its badge, as MUI's Badge did
	<span
		className={cn(
			'absolute right-5 bottom-[22px] z-10 inline-flex',
			zoomTransition(isVisible)
		)}
	>
		{/* MUI's small Fab: a raised round 40px button */}
		<Button
			variant="ghost"
			color="neutral"
			size="icon-lg"
			className="rounded-full bg-white! shadow-[0px_3px_5px_-1px_rgba(0,0,0,0.2),0px_6px_10px_0px_rgba(0,0,0,0.14),0px_1px_18px_0px_rgba(0,0,0,0.12)] [&_.app-icon]:size-6! [&_.app-icon]:text-(--color-primary-light)!"
			onClick={onClick}
		>
			<ArrowDownward />
		</Button>
		{newMessageCount !== 0 && (
			<Badge
				variant="solid"
				color="primary"
				size="sm"
				className="absolute top-[3px] left-[3px] z-1 min-w-5 -translate-x-1/2 -translate-y-1/2"
			>
				{newMessageCount > 99 ? '99+' : newMessageCount}
			</Badge>
		)}
	</span>
);

export default ScrollToBottomButton;
