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
