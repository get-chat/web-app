import { useMemo } from 'react';
import { Message } from '@src/types/messages';
import { getMessageTimestamp } from '@src/helpers/MessageHelper';

interface Props {
	reactionsHistory?: Message[];
}

const useReactions = ({ reactionsHistory }: Props) => {
	const getLatestReactions = (): Message[] => {
		const latestReactionsMap: Map<string, Message> = new Map();

		reactionsHistory?.forEach((reaction) => {
			const sender = reaction.waba_payload?.from ?? '';
			const existingReaction = latestReactionsMap.get(sender);

			// Update the map if no entry exists or if this reaction has a later timestamp
			if (
				!existingReaction ||
				getMessageTimestamp(reaction) > getMessageTimestamp(existingReaction)
			) {
				latestReactionsMap.set(sender, reaction);
			}
		});

		// Convert the map back to an array
		return Array.from(latestReactionsMap.values());
	};

	const reactions = useMemo(() => getLatestReactions(), [reactionsHistory]);

	const reactionsWithCount = useMemo(() => {
		return Object.entries(
			reactions
				.filter((reaction) => !!reaction.waba_payload?.reaction?.emoji)
				.map((reaction) => reaction.waba_payload?.reaction!.emoji)
				.reduce((acc: { [emoji: string]: number }, emoji) => {
					acc[emoji ?? ''] = (acc[emoji ?? ''] || 0) + 1;
					return acc;
				}, {})
		).map(([emoji, count]) => ({ emoji, count }));
	}, [reactions]);

	return {
		reactions,
		reactionsWithCount,
	};
};

export default useReactions;
