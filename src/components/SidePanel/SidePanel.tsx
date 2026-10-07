import React from 'react';
import CloseIcon from '@src/components/icons/Close';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/lib/utils';
import {
	PanelTransitionProps,
	sidePanelAnimation,
} from '@src/styles/panelTransitions';

interface Props extends PanelTransitionProps {
	title: React.ReactNode;
	onClose: () => void;
	className?: string;
	titleClassName?: string;
	headerClassName?: string;
	children: React.ReactNode;
}

/**
 * A panel next to the chat (contact details, search...), with a grey header
 * and a close button. On phones it covers the chat.
 */
const SidePanel: React.FC<Props> = ({
	title,
	onClose,
	isExiting,
	onAnimationEnd,
	className,
	titleClassName,
	headerClassName,
	children,
}) => (
	<div
		className={cn(
			'flex flex-[0.4_1] flex-col border-l border-[lightgray] max-md:absolute max-md:inset-0 max-md:z-10 max-md:border-l-0',
			sidePanelAnimation(isExiting),
			className
		)}
		onAnimationEnd={onAnimationEnd}
	>
		<div
			className={cn(
				'flex h-(--header-height) items-center bg-gray-light px-3.75 py-1 max-md:px-2.5',
				headerClassName
			)}
		>
			<Button variant="ghost" color="neutral" size="icon-xl" onClick={onClose}>
				<CloseIcon />
			</Button>

			<h3 className={cn('ml-3.75 text-[18px] font-normal', titleClassName)}>
				{title}
			</h3>
		</div>

		{children}
	</div>
);

export default SidePanel;
