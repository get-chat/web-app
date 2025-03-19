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
import '../../styles/ChatTags.css';
import { getHubURL } from '@src/helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import SellIcon from '@mui/icons-material/Sell';
import { AxiosResponse } from 'axios';
import { Tag } from '@src/types/tags';
import { fetchTags } from '@src/api/tagsApi';
import { fetchChat } from '@src/api/chatsApi';
import { Chat } from '@src/types/chats';

function ChatTags(props: any) {
	// @ts-ignore
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
		props.setOpen(false);
	};

	const onDeleteTag = (tag: Tag) => {
		deleteChatTagging(tag);
	};

	const onClickTag = (tag: Tag) => {
		createChatTagging(tag);
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
		if (!props.waId) return;
		try {
			const data = await fetchChat(props.waId);
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

	const createChatTagging = (tag: Tag) => {
		apiService.createChatTaggingCall(
			props.waId,
			tag.id,
			(response: AxiosResponse) => {
				setChatTags((prevState) => {
					let nextState = prevState.filter((curTag) => {
						return curTag.id !== tag.id;
					});

					tag.tagging_id = response.data.id;

					nextState.push(tag);
					nextState = makeUniqueTagsArray(nextState);

					return nextState;
				});
			}
		);
	};

	const deleteChatTagging = (tag: Tag) => {
		apiService.deleteChatTaggingCall(
			tag.tagging_id,
			(response: AxiosResponse) => {
				setChatTags((prevState) => {
					let nextState = prevState.filter((curTag) => {
						return curTag.id !== tag.id;
					});
					nextState = makeUniqueTagsArray(nextState);
					return nextState;
				});
			}
		);
	};

	return (
		<Dialog open={props.open} onClose={close} className="chatTagsWrapper">
			<DialogTitle>{t('Chat tags')}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{t('You can add or remove tags for this chat.')}
				</DialogContentText>

				{chatTags && (
					<div className="chatTags__tags current mt-3">
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
							<div className="chatTags__tags__empty mt-1">{t('Empty')}</div>
						)}
					</div>
				)}

				{allTags && (
					<div className="chatTags__tags mt-3">
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
							<div className="chatTags__tags__empty mt-1">{t('Empty')}</div>
						)}
					</div>
				)}

				<div className="mt-3">
					<Link
						href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
						target="_blank"
						underline="hover"
					>
						{t('Manage tags')}
					</Link>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				{/*<Button color="primary">Update</Button>*/}
			</DialogActions>

			{isLoading && (
				<div className="chatTagsWrapper__loading">
					<CircularProgress size={28} />
				</div>
			)}
		</Dialog>
	);
}

export default ChatTags;
