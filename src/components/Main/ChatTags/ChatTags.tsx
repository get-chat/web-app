import React, { useContext } from 'react';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Spinner } from '@src/components/ui/spinner';
import * as Styled from './ChatTags.styles';
import { getHubURL } from '@src/helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import SellIcon from '@mui/icons-material/Sell';
import AddIcon from '@mui/icons-material/Add';
import { Tag } from '@src/types/tags';
import useTags from '@src/hooks/useTags';
import CreateTagControl from '@src/components/CreateTagControl/CreateTagControl';

// MUI Chip's dark label (the neutral Badge text is lighter)
const chipClassName = 'text-foreground';

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
		doDeleteChatTagging,
		doCreateChatTagging,
		doCreateTag,
	} = useTags({ loadInitially: true, waId: waId });

	const onClickTag = async (tag: Tag) => {
		await doCreateChatTagging(tag);
	};

	const onDeleteTag = async (tag: Tag) => {
		await doDeleteChatTagging(tag);
	};

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('Chat tags')}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<DialogDescription>
						{t('You can add or remove tags for this chat.')}
					</DialogDescription>

					{chatTags && (
						<Styled.TagsContainer>
							<h5>{t('Current tags')}</h5>
							{chatTags?.length > 0 ? (
								<div>
									{chatTags.map((tag) => (
										<Badge
											key={tag.id}
											size="lg"
											className={chipClassName}
											onDelete={() => onDeleteTag(tag)}
										>
											<SellIcon
												style={{
													fill: tag.web_inbox_color,
												}}
											/>
											{tag.name}
										</Badge>
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
										<Badge
											key={tag.id}
											asChild
											size="lg"
											className={chipClassName}
										>
											<button type="button" onClick={() => onClickTag(tag)}>
												<SellIcon
													style={{
														fill: tag.web_inbox_color,
													}}
												/>
												{tag.name}
											</button>
										</Badge>
									))}
								</div>
							) : (
								<Styled.EmptyTags>{t('Empty')}</Styled.EmptyTags>
							)}
						</Styled.TagsContainer>
					)}

					<Styled.TagsContainer>
						<CreateTagControl
							doCreateTag={doCreateTag}
							trigger={(openForm) => (
								<Badge
									asChild
									variant="outline"
									size="lg"
									className={chipClassName}
								>
									<button type="button" onClick={openForm}>
										<AddIcon />
										{t('Create new tag')}
									</button>
								</Badge>
							)}
						/>
					</Styled.TagsContainer>

					<Styled.ManageTagsLink>
						<Button asChild variant="link" color="primary" size="none">
							<a
								href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
								target="_blank"
							>
								{t('Manage tags')}
							</a>
						</Button>
					</Styled.ManageTagsLink>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
				</DialogFooter>

				{isLoading && (
					<Styled.LoadingOverlay>
						<Spinner size={28} className="text-primary" />
					</Styled.LoadingOverlay>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ChatTags;
