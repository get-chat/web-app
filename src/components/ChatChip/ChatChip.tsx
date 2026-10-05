import React from 'react';
import CustomAvatar from '@src/components/CustomAvatar';
import ExpandMoreIcon from '@src/components/icons/KeyboardArrowDown';
import { cn } from '@src/lib/utils';

/*
 * The small rounded chips about a chat (assignee, tags): a mini avatar, a
 * label and, when the chip opens a menu, a chevron.
 */

interface ChatChipProps extends React.ComponentProps<'div'> {
	/** Focusable and with a pointer cursor, e.g. when it opens a menu */
	isClickable?: boolean;
}

const ChatChip: React.FC<ChatChipProps> = ({
	isClickable = false,
	className,
	...props
}) => (
	<div
		role={isClickable ? 'button' : undefined}
		tabIndex={isClickable ? 0 : undefined}
		className={cn(
			'relative flex h-4.75 items-center rounded-[10px] bg-gray-light text-[12px] outline-none! select-none',
			isClickable ? 'cursor-pointer' : 'cursor-default',
			className
		)}
		{...props}
	/>
);

interface ChatChipAvatarProps {
	/** Colours the avatar (and its initials) after this text */
	generateBgColorBy?: string;
	className?: string;
	children: React.ReactNode;
}

/** The chip's leading avatar: initials or an icon */
export const ChatChipAvatar: React.FC<ChatChipAvatarProps> = ({
	generateBgColorBy,
	className,
	children,
}) => (
	<CustomAvatar
		className={cn(
			'mr-1.25 size-4.75 self-center text-[11px]/none [&_.app-icon]:mx-0.75 [&_.app-icon]:size-[0.5em]!',
			className
		)}
		generateBgColorBy={generateBgColorBy}
	>
		{children}
	</CustomAvatar>
);

interface ChatChipLabelProps {
	/** Room for a longer label, e.g. a user and a group */
	isWide?: boolean;
	children: React.ReactNode;
}

export const ChatChipLabel: React.FC<ChatChipLabelProps> = ({
	isWide = false,
	children,
}) => (
	<span
		className={cn(
			'-ml-0.5 mr-1.25 truncate',
			isWide ? 'max-w-[110px]' : 'max-w-[55px]'
		)}
	>
		{children}
	</span>
);

/** The chevron of a chip that opens a menu */
export const ChatChipChevron: React.FC = () => (
	<span className="-ml-0.5 flex size-4.75 items-center justify-center rounded-full [&_.app-icon]:mx-0.75 [&_.app-icon]:size-[0.6em]! [&_.app-icon]:text-(--default-text-color)!">
		<ExpandMoreIcon />
	</span>
);

export default ChatChip;
