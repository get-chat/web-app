import React, { Fragment, memo, useMemo } from 'react';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import * as Styled from './ChatBodySkeleton.styles';

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
		<Styled.Container
			aria-hidden
			data-test-id="chat-body-skeleton"
			$isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			{rows.map((row, index) => {
				switch (row.kind) {
					case 'date':
						return (
							<Styled.CenteredRow $isDate key={index}>
								<Styled.Pill width={96} height={29} />
							</Styled.CenteredRow>
						);
					case 'event':
						return (
							<Styled.CenteredRow key={index}>
								<Styled.Pill width={row.width} height={row.height} />
								<Styled.EventTimestamp width={32} />
							</Styled.CenteredRow>
						);
					case 'group':
						return (
							<Fragment key={index}>
								<Styled.SenderName
									$isOutgoing={row.isOutgoing}
									width={row.nameWidth}
								/>
								{row.bubbles.map((bubble, bubbleIndex) => (
									<Styled.Bubble
										key={bubbleIndex}
										$isOutgoing={row.isOutgoing}
										$isFirstInGroup={bubbleIndex === 0}
										width={bubble.width}
										height={bubble.height}
									/>
								))}
							</Fragment>
						);
				}
			})}
		</Styled.Container>
	);
};

// Memoized: ChatView re-renders frequently while a chat loads, and the
// skeleton's output only depends on its two stable props
export default memo(ChatBodySkeleton);
