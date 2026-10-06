import React from 'react';
import { ArrowBack } from '@src/components/icons';
import PanelHeader from '@src/components/PanelHeader';
import { cn } from '@src/lib/utils';
import {
	overlayPanelAnimation,
	PanelTransitionProps,
} from '@src/styles/panelTransitions';

interface Props extends PanelTransitionProps {
	title: React.ReactNode;
	onHide: () => void;
	children: React.ReactNode;
}

/** A panel over the sidebar with a back button and a stack of sections */
const ProfilePanel: React.FC<Props> = ({
	title,
	onHide,
	isExiting,
	onAnimationEnd,
	children,
}) => (
	<div
		className={cn(
			'absolute inset-0 z-10 flex flex-col bg-gray-light',
			overlayPanelAnimation(isExiting)
		)}
		onAnimationEnd={onAnimationEnd}
	>
		<PanelHeader title={title} icon={<ArrowBack />} onClose={onHide} />

		<div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
	</div>
);

interface SectionProps {
	className?: string;
	children: React.ReactNode;
}

/** A white card in a profile panel */
export const ProfileSection: React.FC<SectionProps> = ({
	className,
	children,
}) => (
	<div
		className={cn(
			'mb-2.5 bg-white p-5 shadow-[0_1px_3px_var(--shadow-light)]',
			className
		)}
	>
		{children}
	</div>
);

interface SectionHeaderProps {
	title: React.ReactNode;
	/** An icon at the end of the header, e.g. a shortcut */
	action?: React.ReactNode;
}

export const ProfileSectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	action,
}) => (
	<div className="mb-3.75 flex [&_.app-icon]:cursor-pointer [&_.app-icon]:text-black!">
		<h5 className="flex-1 text-[14px] font-normal text-primary">{title}</h5>
		{action}
	</div>
);

/** Secondary text in a profile section */
export const profileTextClass = 'text-[14px] text-ink/60';

export default ProfilePanel;
