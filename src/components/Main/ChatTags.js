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
import { getHubURL } from '../../helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfig } from '../../contexts/AppConfig';
import { ApplicationContext } from '../../contexts/ApplicationContext';

function ChatTags(props) {
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfig);

	const { t } = useTranslation();

	const [isLoading, setLoading] = useState(true);
	const [chat, setChat] = useState();
	const [chatTags, setChatTags] = useState([]);
	const [unusedTags, setUnusedTags] = useState([]);
	const [allTags, setAllTags] = useState([]);

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

	const onDeleteTag = (tag) => {
		deleteChatTagging(tag);
	};

	const onClickTag = (tag) => {
		createChatTagging(tag);
	};

	const makeUniqueTagsArray = (tagsArray) => {
		const uniqueTagsArray = {};
		tagsArray.forEach((tag) => {
			if (!uniqueTagsArray.hasOwnProperty(tag.id)) {
				uniqueTagsArray[tag.id] = tag;
			}
		});

		return Object.values(uniqueTagsArray);
	};

	const retrieveChat = () => {
		apiService.retrieveChatCall(props.waId, (response) => {
			setChat(response.data);
			setChatTags(response.data.tags);

			// Next
			listTags();
		});
	};

	const listTags = () => {
		apiService.listTagsCall((response) => {
			setAllTags(response.data.results);
			setLoading(false);
		});
	};

	const createChatTagging = (tag) => {
		apiService.createChatTaggingCall(props.waId, tag.id, (response) => {
			setChatTags((prevState) => {
				let nextState = prevState.filter((curTag) => {
					return curTag.id !== tag.id;
				});

				tag.tagging_id = response.data.id;

				nextState.push(tag);
				nextState = makeUniqueTagsArray(nextState);

				return nextState;
			});
		});
	};

	const deleteChatTagging = (tag) => {
		apiService.deleteChatTaggingCall(tag.tagging_id, (response) => {
			setChatTags((prevState) => {
				let nextState = prevState.filter((curTag) => {
					return curTag.id !== tag.id;
				});
				nextState = makeUniqueTagsArray(nextState);
				return nextState;
			});
		});
	};

	return (
		<Dialog open={props.open} onClose={close} className="chatTagsWrapper">
			<DialogTitle>{t('Chat tags')}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{t('You can add or remove tags for this chat.')}
				</DialogContentText>

				{chatTags && (
					<div className="chatTags__tags current">
						<h5>{t('Current tags')}</h5>
						{chatTags?.length > 0 ? (
							<div>
								{chatTags.map((tag) => (
									<Chip
										key={tag.id}
										label={tag.name}
										onDelete={() => onDeleteTag(tag)}
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
						href={getHubURL(config.API_BASE_URL) + 'main/tag/'}
						target="_blank"
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
