import React, { useContext, useState } from 'react';
import * as Styled from './ChatTagsList.styles';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Link,
	ListItem,
	TextField,
} from '@mui/material';
import { getHubURL } from '@src/helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import { setTags } from '@src/store/reducers/tagsReducer';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { Tag } from '@src/types/tags';
import { createTag } from '@src/api/tagsApi';
import { DEFAULT_TAG_COLOR } from '@src/helpers/TagHelper';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const ChatTagsList: React.FC<Props> = ({ open, setOpen }) => {
	const config = useContext(AppConfigContext);

	const tags = useAppSelector((state) => state.tags.value);

	const { t } = useTranslation();

	const [isLoading, setLoading] = useState(false);

	const [isCreating, setCreating] = useState(false);
	const [newTagName, setNewTagName] = useState('');
	const [isSaving, setSaving] = useState(false);

	const dispatch = useAppDispatch();

	const cancelCreateTag = () => {
		setCreating(false);
		setNewTagName('');
	};

	const close = () => {
		cancelCreateTag();
		setOpen(false);
	};

	const handleClick = (tag: Tag | undefined) => {
		dispatch(setFilterTagId(tag?.id));
		close();
	};

	const handleCreateTag = async () => {
		const name = newTagName.trim();
		if (!name || isSaving) return;

		setSaving(true);
		try {
			// Created without assigning it to any chat, just made available for filtering.
			const createdTag = await createTag({
				name,
				web_inbox_color: DEFAULT_TAG_COLOR,
			});
			dispatch(setTags([...(tags ?? []), createdTag]));
		} catch (error) {
			console.error(error);
		}
		setSaving(false);
		cancelCreateTag();
	};

	return (
		<Styled.DialogWrapper open={open} onClose={close}>
			<DialogTitle>{t('Tags')}</DialogTitle>
			<DialogContent>
				<Styled.DialogContentWrapper>
					{t('You can filter chats by tags.')}
				</Styled.DialogContentWrapper>

				{tags && (
					<div>
						{tags.length > 0 ? (
							<div>
								{tags.map((tag) => (
									<ListItem
										key={tag.id}
										button
										onClick={() => handleClick(tag)}
									>
										<Styled.TagItem>
											<SellIcon style={{ fill: tag.web_inbox_color }} />
											{tag.name}
										</Styled.TagItem>
									</ListItem>
								))}
							</div>
						) : (
							<Styled.EmptyState>{t('Empty')}</Styled.EmptyState>
						)}
					</div>
				)}

				<Styled.CreateTagContainer>
					{isCreating ? (
						<Styled.CreateTagForm
							onSubmit={(event) => {
								event.preventDefault();
								handleCreateTag();
							}}
						>
							<TextField
								variant="standard"
								size="small"
								autoFocus
								fullWidth
								placeholder={t('Tag name')}
								value={newTagName}
								onChange={(event) => setNewTagName(event.target.value)}
								disabled={isSaving}
							/>
							<IconButton
								type="submit"
								color="primary"
								size="small"
								aria-label={t('Save')}
								disabled={!newTagName.trim() || isSaving}
							>
								<CheckIcon />
							</IconButton>
						</Styled.CreateTagForm>
					) : (
						<Button
							startIcon={<AddIcon />}
							onClick={() => setCreating(true)}
							size="small"
						>
							{t('Create new tag')}
						</Button>
					)}
				</Styled.CreateTagContainer>

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
		</Styled.DialogWrapper>
	);
};

export default ChatTagsList;
