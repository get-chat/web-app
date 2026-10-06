import { MessageType } from '@src/types/messages';
import { cn } from '@src/lib/utils';

/**
 * The first message of each sender group carries a small tail pointing to
 * the sender's side. It inherits the bubble's background, so it matches
 * every bubble colour. Shared with ChatBodySkeleton, so the placeholder
 * bubbles keep exactly the same shape.
 *
 * The tail is a soft sweep with a rounded tip, leaving the bubble edge
 * tangentially so the junction stays smooth.
 */
export const messageBubbleTailClassName = (isOutgoing?: boolean) =>
	isOutgoing
		? "rounded-tr-none before:absolute before:top-0 before:-right-1.5 before:h-2.5 before:w-1.5 before:bg-inherit before:content-[''] before:[clip-path:path('M0_0_L0_10_C0_8_1.4_5.6_5.4_2.6_Q6_1_4.4_0_Z')]"
		: "rounded-tl-none before:absolute before:top-0 before:-left-1.5 before:h-2.5 before:w-1.5 before:bg-inherit before:content-[''] before:[clip-path:path('M6_0_L6_10_C6_8_4.6_5.6_0.6_2.6_Q0_1_1.6_0_Z')]";

interface MessageBubbleOptions {
	type?: MessageType;
	isOutgoing?: boolean;
	/** Has media to preview: the bubble shrinks to it */
	hasMedia?: boolean;
	/** Makes room for the reactions pill below */
	hasReaction?: boolean;
	/** Continues the group above: pulled up under its sender name */
	isSenderHidden?: boolean;
	/** The first of its sender group: carries the tail */
	isFirstInGroup?: boolean;
}

/**
 * A message bubble. Keeps the chat__message class, which Chat.css and the
 * panels above the footer still style.
 */
export const messageBubbleClassName = ({
	type,
	isOutgoing,
	hasMedia,
	hasReaction,
	isSenderHidden,
	isFirstInGroup,
}: MessageBubbleOptions) =>
	cn(
		'chat__message relative mb-6.25 max-w-[70%] rounded-[12px] bg-white px-2.5 py-1.25 text-[14px] shadow-[0_1px_1px_rgba(94,56,38,0.1),0_2px_6px_-2px_rgba(94,56,38,0.12)] transition-opacity duration-1000 ease-[ease] [&_.printMessage]:whitespace-pre-line [&_a]:text-light-blue [&_img]:bg-ink/10',
		hasMedia || type === MessageType.location ? 'w-min' : 'w-fit',
		isSenderHidden ? '-mt-5.5' : 'mt-0',
		hasReaction && 'mb-10.5',
		isOutgoing && 'ml-auto bg-[#dcf8c6]',
		// Templates and interactive messages are yellow on either side
		(type === MessageType.template || type === MessageType.interactive) &&
			'bg-[#f4f0d7]!',
		isFirstInGroup && messageBubbleTailClassName(isOutgoing)
	);

/** An image, video or map inside a bubble, reaching out to its edges */
export const messageMediaClassName =
	'-mx-1.5 -mt-px mb-[4px] block h-[150px] w-[250px] cursor-pointer rounded-[8px] border-none object-cover';

/**
 * A message's status tick (sent, delivered, read, failed), sized by its
 * font size. All but the pending one pop in, since a status change swaps
 * the icon.
 */
export const statusIconClassName = (isAnimated = true) =>
	cn('ml-1.25', isAnimated && 'motion-safe:animate-status-in');
