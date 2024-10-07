import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { useMemo } from 'react';

interface Props {
	reactionsHistory?: ChatMessageModel[];
}

const useChatMessage = ({ reactionsHistory }: Props) => {
	const getLatestReactions = (): ChatMessageModel[] => {
		const latestReactionsMap: Map<string, ChatMessageModel> = new Map();

		reactionsHistory?.forEach((reaction) => {
			const sender = reaction.payload.from;
			const existingReaction = latestReactionsMap.get(sender);

			// Update the map if no entry exists or if this reaction has a later timestamp
			if (
				!existingReaction ||
				reaction.timestamp > existingReaction.timestamp
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
				.filter((reaction) => !!reaction.reaction?.emoji)
				.map((reaction) => reaction.reaction!.emoji)
				.reduce((acc: { [emoji: string]: number }, emoji) => {
					acc[emoji] = (acc[emoji] || 0) + 1;
					return acc;
				}, {})
		).map(([emoji, count]) => ({ emoji, count }));
	}, [reactions]);

	return {
		reactions,
		reactionsWithCount,
	};
};

export default useChatMessage;
