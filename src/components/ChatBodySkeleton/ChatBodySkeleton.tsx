import React, { Fragment, memo, useMemo } from 'react';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { Skeleton } from '@src/components/ui/skeleton';
import { messageBubbleTailClassName } from '@src/components/Main/Chat/ChatMessage/messageBubble';
import { cn } from '@src/lib/utils';

// Mirrors .chat__message__dateContainer and the assignment/tagging event
// rows: a centred pill, for events with a timestamp below
const centeredRowClassName = 'flex flex-col items-center';

type BubbleSpec = { width: string; height: number };

type SkeletonRow =
	| { kind: 'date' }
	| { kind: 'event'; width: number; height: number }
	| {
			kind: 'group';
			isOutgoing: boolean;
			nameWidth: number;
			bubbles: BubbleSpec[];
	  };

const randomBetween = (min: number, max: number) =>
	min + Math.random() * (max - min);

const randomFrom = <T,>(values: T[]): T =>
	values[Math.floor(Math.random() * values.length)];

/* Bubble heights follow the line count: a one-line text message is 31px
(2 x 5px padding + one ~21px line), each further line adds 21px */
const generateBubble = (): BubbleSpec => {
	const roll = Math.random();

	// Short one-liners ("Hey", "Thanks!") are the most common messages, so
	// they get fixed small widths instead of a share of the pane
	if (roll < 0.45) {
		return { width: `${Math.round(randomBetween(64, 150))}px`, height: 31 };
	}

	if (roll < 0.8) {
		return {
			width: `${Math.round(randomBetween(18, 38))}%`,
			height: randomFrom([31, 31, 52]),
		};
	}

	return {
		width: `${Math.round(randomBetween(38, 55))}%`,
		height: randomFrom([52, 73]),
	};
};

const generateRows = (): SkeletonRow[] => {
	const rows: SkeletonRow[] = [{ kind: 'date' }];

	// One event row is always present, at a random position between groups
	const groupCount = randomFrom([3, 4]);
	const eventAfterGroup = Math.floor(randomBetween(0, groupCount));

	let isOutgoing = Math.random() < 0.5;
	for (let i = 0; i < groupCount; i++) {
		rows.push({
			kind: 'group',
			isOutgoing,
			nameWidth: Math.round(randomBetween(50, 110)),
			bubbles: Array.from(
				{ length: randomFrom([1, 1, 2, 2, 3]) },
				generateBubble
			),
		});

		if (i === eventAfterGroup) {
			rows.push({
				kind: 'event',
				width: Math.round(randomBetween(160, 300)),
				// A one-line event or one with a detail line below the title
				height: randomFrom([28, 46]),
			});
		}

		// Senders mostly alternate, but sometimes the same sender continues
		// with a new group
		if (Math.random() < 0.8) {
			isOutgoing = !isOutgoing;
		}
	}

	return rows;
};

/**
 * Placeholder overlaying the chat body while a chat initially loads: a
 * date indicator, incoming and outgoing message groups and centered
 * assignment/tagging event rows, shaped like the real components. The
 * pattern is randomized per mount for variety. Cross-fades away over
 * the loaded messages via the forwarded transition props.
 */
const ChatBodySkeleton: React.FC<PanelTransitionProps> = ({
	isExiting,
	onAnimationEnd,
}) => {
	const rows = useMemo(generateRows, []);

	return (
		/*
		 * Overlays the chat body, inside its positioning context, without
		 * taking part in its layout, so it never affects the body's height or
		 * scrollbar. Transparent: the bubbles sit over the chat view's own
		 * wallpaper and dissolve while the loaded messages fade in underneath.
		 * No z-index on purpose: as the last positioned sibling it already
		 * paints above the body's content, and a positive one would lift it
		 * above the loading screen while that fades out. It mirrors the body's
		 * padding, border and scrollbar gutter, so the bubbles line up with
		 * the messages beneath; when the body is shorter than the pattern, the
		 * top rows are clipped rather than squeezed.
		 */
		<div
			aria-hidden
			data-test-id="chat-body-skeleton"
			className={cn(
				'pointer-events-none absolute inset-0 flex flex-col justify-end overflow-hidden p-(--chat-body-padding) [scrollbar-gutter:stable] *:shrink-0',
				isExiting && 'motion-safe:animate-[fade-out_0.25s_ease-out_forwards]'
			)}
			// The body's border, invisible: a shorthand set by ChatView, so the
			// colour has to follow it, which classes can't guarantee
			style={{
				borderLeft: 'var(--chat-body-border-left)',
				borderLeftColor: 'transparent',
			}}
			onAnimationEnd={onAnimationEnd}
		>
			{rows.map((row, index) => {
				switch (row.kind) {
					case 'date':
						return (
							<div
								className={cn(centeredRowClassName, 'mx-2.5 mt-5 mb-7.5')}
								key={index}
							>
								<Skeleton
									variant="rounded"
									className="rounded-[15px]"
									style={{ width: 96, height: 29 }}
								/>
							</div>
						);
					case 'event':
						return (
							<div className={cn(centeredRowClassName, 'mb-6.25')} key={index}>
								<Skeleton
									variant="rounded"
									className="rounded-[15px]"
									style={{ width: row.width, height: row.height }}
								/>
								<Skeleton
									variant="text"
									className="mt-1.25 text-[length:x-small]"
									style={{ width: 32 }}
								/>
							</div>
						);
					case 'group':
						return (
							<Fragment key={index}>
								{/* Mirrors the sender name above a message group */}
								<Skeleton
									variant="text"
									className={cn(
										'mx-2.5 mt-0 mb-0.5 text-[length:x-small]',
										row.isOutgoing && 'self-end'
									)}
									style={{ width: row.nameWidth }}
								/>
								{row.bubbles.map((bubble, bubbleIndex) => (
									// Mirrors a message bubble: its radius, the overlap
									// within a group and the tail on the group's first
									<Skeleton
										key={bubbleIndex}
										variant="rounded"
										className={cn(
											'relative mb-6.25 max-w-[70%] rounded-[12px]',
											row.isOutgoing && 'ml-auto',
											bubbleIndex === 0
												? messageBubbleTailClassName(row.isOutgoing)
												: '-mt-5.5'
										)}
										style={{ width: bubble.width, height: bubble.height }}
									/>
								))}
							</Fragment>
						);
				}
			})}
		</div>
	);
};

// Memoized: ChatView re-renders frequently while a chat loads, and the
// skeleton's output only depends on its two stable props
export default memo(ChatBodySkeleton);
