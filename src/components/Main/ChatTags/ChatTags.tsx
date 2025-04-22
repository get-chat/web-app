import React, { useEffect, useState } from 'react';
import {
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Link,
} from '@mui/material';
import * as Styled from './ChatTags.styles';
import { getHubURL } from '@src/helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import SellIcon from '@mui/icons-material/Sell';
import { AxiosError, AxiosResponse } from 'axios';
import { Tag } from '@src/types/tags';
import { fetchTags } from '@src/api/tagsApi';
import { fetchChat } from '@src/api/chatsApi';
import { Chat } from '@src/types/chats';
import { createChatTagging, deleteChatTagging } from '@src/api/chatTaggingApi';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	waId?: string;
}

const ChatTags: React.FC<Props> = ({ open, setOpen, waId }) => {
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfigContext);

	const { t } = useTranslation();

	const [isLoading, setLoading] = useState(true);
	const [chat, setChat] = useState<Chat>();
	const [chatTags, setChatTags] = useState<Tag[]>([]);
	const [unusedTags, setUnusedTags] = useState<Tag[]>([]);
	const [allTags, setAllTags] = useState<Tag[]>([]);

	useEffect(() => {
		retrieveChat();
	}, []);

	useEffect(() => {
		const nextState = allTags.filter((tag) => {
			if (chatTags) {
				let found = false;
				for (let i = 0; i < chatTags.length; i++) {
					const curTag = chatTags[i];
					if (curTag.id === tag.id) {
						found = true;
						break;
					}
				}
				if (!found) {
					return true;
				}
			} else {
				return true;
			}
		});

		setUnusedTags(nextState);
	}, [chatTags, allTags]);

	const close = () => {
		setOpen(false);
	};

	const onDeleteTag = async (tag: Tag) => {
		await doDeleteChatTagging(tag);
	};

	const onClickTag = async (tag: Tag) => {
		await doCreateChatTagging(tag);
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
			setChat(data);
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
			setChatTags((prevState) => {
				let nextState = prevState.filter((curTag) => {
					return curTag.id !== tag.id;
				});

				tag.tagging_id = data.id;

				nextState.push(tag);
				nextState = makeUniqueTagsArray(nextState);

				return nextState;
			});
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
			setChatTags((prevState) => {
				let nextState = prevState.filter((curTag) => {
					return curTag.id !== tag.id;
				});
				nextState = makeUniqueTagsArray(nextState);
				return nextState;
			});
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return (
		<Dialog open={open} onClose={close}>
			<DialogTitle>{t('Chat tags')}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{t('You can add or remove tags for this chat.')}
				</DialogContentText>

				{chatTags && (
					<Styled.TagsContainer>
						<h5>{t('Current tags')}</h5>
						{chatTags?.length > 0 ? (
							<div>
								{chatTags.map((tag) => (
									<Chip
										key={tag.id}
										label={tag.name}
										onDelete={() => onDeleteTag(tag)}
										icon={
											<SellIcon
												style={{
													fill: tag.web_inbox_color,
												}}
											/>
										}
									/>
								))}
							</div>
						) : (
							<Styled.EmptyTags>{t('Empty')}</Styled.EmptyTags>
						)}
					</Styled.TagsContainer>
				)}

				{allTags && (
					<Styled.TagsContainer>
						<h5>All tags</h5>
						{unusedTags?.length > 0 ? (
							<div>
								{unusedTags.map((tag) => (
									<Chip
										key={tag.id}
										label={tag.name}
										clickable
										onClick={() => onClickTag(tag)}
										icon={
											<SellIcon
												style={{
													fill: tag.web_inbox_color,
												}}
											/>
										}
									/>
								))}
							</div>
						) : (
							<Styled.EmptyTags>{t('Empty')}</Styled.EmptyTags>
						)}
					</Styled.TagsContainer>
				)}

				<Styled.ManageTagsLink>
					<Link
						href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
						target="_blank"
						underline="hover"
					>
						{t('Manage tags')}
					</Link>
				</Styled.ManageTagsLink>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
			</DialogActions>

			{isLoading && (
				<Styled.LoadingOverlay>
					<CircularProgress size={28} />
				</Styled.LoadingOverlay>
			)}
		</Dialog>
	);
};

export default ChatTags;
