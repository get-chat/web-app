import { AxiosError } from 'axios';
import { Tag } from '@src/types/tags';
import { fetchTags } from '@src/api/tagsApi';
import { fetchChat } from '@src/api/chatsApi';
import { createChatTagging, deleteChatTagging } from '@src/api/chatTaggingApi';
import { useEffect, useState } from 'react';

interface Props {
	loadInitially?: boolean;
	waId?: string | undefined;
}

const useTags = ({ loadInitially, waId }: Props) => {
	const [isLoading, setLoading] = useState(true);
	const [chatTags, setChatTags] = useState<Tag[]>([]);
	const [unusedTags, setUnusedTags] = useState<Tag[]>([]);
	const [allTags, setAllTags] = useState<Tag[]>([]);

	useEffect(() => {
		if (loadInitially) {
			retrieveChat();
		}
	}, [loadInitially]);

	useEffect(() => {
		const nextState = allTags.filter((tag) => {
			return !chatTags || !chatTags.some((chatTag) => chatTag.id === tag.id);
		});

		setUnusedTags(nextState);
	}, [chatTags, allTags]);

	const onDeleteTag = async (tag: Tag) => {
		await doDeleteChatTagging(tag);
	};

	const makeUniqueTagsArray = (tagsArray: Tag[]) => {
		const uniqueTagsArray: { [key: string]: Tag } = {};
		tagsArray.forEach((tag: Tag) => {
			if (!uniqueTagsArray.hasOwnProperty(tag.id)) {
				uniqueTagsArray[tag.id] = tag;
			}
		});

		return Object.values(uniqueTagsArray);
	};

	const retrieveChat = async () => {
		if (!waId) return;
		try {
			const data = await fetchChat(waId);
			setChatTags(data.tags);

			// Next
			await listTags();
		} catch (error) {
			console.error(error);
		}
	};

	const listTags = async () => {
		try {
			const data = await fetchTags();
			setAllTags(data.results);
			setLoading(false);
		} catch (error) {
			console.error(error);
		}
	};

	const doCreateChatTagging = async (tag: Tag) => {
		try {
			const data = await createChatTagging({
				tag: tag.id,
				chat: waId ?? '',
			});

			const updatedTag = { ...tag, tagging_id: data.id };

			setChatTags((prev) =>
				makeUniqueTagsArray([
					...prev.filter((t) => t.id !== tag.id),
					updatedTag,
				])
			);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	const doDeleteChatTagging = async (tag: Tag) => {
		if (!tag.tagging_id) {
			console.warn('Chat tagging id is missing!', tag);
			return;
		}

		try {
			await deleteChatTagging(tag.tagging_id);

			setChatTags((prev) =>
				makeUniqueTagsArray(prev.filter((t) => t.id !== tag.id))
			);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return {
		isLoading,
		chatTags,
		allTags,
		unusedTags,
		onDeleteTag,
		doCreateChatTagging,
	};
};

export default useTags;
