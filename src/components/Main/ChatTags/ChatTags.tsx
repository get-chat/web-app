import React, { useContext } from 'react';
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
import SellIcon from '@mui/icons-material/Sell';
import { Tag } from '@src/types/tags';
import useTags from '@src/hooks/useTags';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	waId?: string;
}

const ChatTags: React.FC<Props> = ({ open, setOpen, waId }) => {
	const config = useContext(AppConfigContext);

	const { t } = useTranslation();

	const {
		isLoading,
		chatTags,
		allTags,
		unusedTags,
		onDeleteTag,
		doCreateChatTagging,
	} = useTags({ loadInitially: true, waId });

	const onClickTag = async (tag: Tag) => {
		await doCreateChatTagging(tag);
	};

	const close = () => {
		setOpen(false);
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
