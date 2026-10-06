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
import { getHubURL } from '@src/helpers/URLHelper';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import SellIcon from '@src/components/icons/Sell';
import AddIcon from '@src/components/icons/Add';
import { Tag } from '@src/types/tags';
import useTags from '@src/hooks/useTags';
import CreateTagControl from '@src/components/CreateTagControl/CreateTagControl';

// MUI Chip's dark label (the neutral Badge text is lighter), spaced as the
// chips were
const chipClassName = 'mt-1.25 mr-1.25 text-foreground';

const sectionClassName = 'mt-3';

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
						<div className={sectionClassName}>
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
								<div className="mt-1 text-[15px] text-ink/60">{t('Empty')}</div>
							)}
						</div>
					)}

					{allTags && (
						<div className={sectionClassName}>
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
								<div className="mt-1 text-[15px] text-ink/60">{t('Empty')}</div>
							)}
						</div>
					)}

					<div className={sectionClassName}>
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
					</div>

					<div className={sectionClassName}>
						<Button asChild variant="link" color="primary" size="none">
							<a
								href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
								target="_blank"
							>
								{t('Manage tags')}
							</a>
						</Button>
					</div>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
				</DialogFooter>

				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-white">
						<Spinner size={28} className="text-primary" />
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ChatTags;
