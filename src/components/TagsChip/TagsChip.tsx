import React, { useContext } from 'react';
import { useAppSelector } from '@src/store/hooks';
import { Tag } from '@src/types/tags';
import SellIcon from '@src/components/icons/Sell';
import UnfoldMoreIcon from '@src/components/icons/UnfoldMore';
import { getHubURL } from '@src/helpers/URLHelper';
import SettingsIcon from '@src/components/icons/Settings';
import AddIcon from '@src/components/icons/Add';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { useTranslation } from 'react-i18next';
import ChatChip, {
	ChatChipAvatar,
	ChatChipChevron,
	ChatChipLabel,
} from '@src/components/ChatChip';
import CheckIcon from '@src/components/icons/Check';
import useTags from '@src/hooks/useTags';
import CreateTagControl from '@src/components/CreateTagControl/CreateTagControl';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import { cn } from '@src/lib/utils';

interface Props {
	waId: string | undefined;
	showChatTagsList: () => void;
	className?: string;
}

// Selected / Available headings of the menu
const menuHeaderClassName =
	'flex items-center gap-[5px] [&_svg]:size-[13px]! [&_svg]:text-menu-muted!';

const TagsChip: React.FC<Props> = ({ waId, showChatTagsList, className }) => {
	const tags = useAppSelector((state) => state.tags.value);
	const currentChatTags = useAppSelector(
		(state) => state.currentChatTags.value
	);
	const config = useContext(AppConfigContext);

	const { doDeleteChatTagging, doCreateChatTagging, doCreateTag } = useTags({
		loadInitially: false,
		waId: waId,
	});
	const { t } = useTranslation();

	// The chip's icon takes the colour of the first tag
	const firstTagColor = currentChatTags[0]?.web_inbox_color;

	const isTagSelected = (tag: Tag): boolean => {
		return currentChatTags.some((t) => t.id === tag.id);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ChatChip className={cn('bg-ink/6', className)} isClickable>
					<ChatChipAvatar
						className={
							firstTagColor
								? 'bg-white'
								: 'bg-inherit [&_.app-icon]:text-black/60!'
						}
					>
						<SellIcon style={{ color: firstTagColor }} />
					</ChatChipAvatar>

					<ChatChipLabel>
						{currentChatTags.length > 0
							? currentChatTags
									.slice(0, 3)
									.map((tag) => tag.name)
									.join(', ')
							: 'Tags'}
					</ChatChipLabel>

					<ChatChipChevron />
				</ChatChip>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				onEscapeKeyDown={(event) => {
					// Escape in the new tag form only closes the form, as with MUI
					if (
						event.target instanceof Element &&
						event.target.closest('[data-slot="create-tag-form"]')
					) {
						event.preventDefault();
					}
				}}
			>
				<DropdownMenuLabel className={menuHeaderClassName}>
					<CheckIcon /> {t('Selected')}
				</DropdownMenuLabel>

				{currentChatTags.map((tag) => (
					<DropdownMenuItem
						className="bg-menu-active"
						onSelect={(event) => {
							// The menu stays open, so several tags can be changed
							event.preventDefault();
							doDeleteChatTagging(tag);
						}}
						key={tag.id}
					>
						<SellIcon
							style={{
								fill: tag.web_inbox_color,
							}}
						/>
						{tag.name}
					</DropdownMenuItem>
				))}

				{currentChatTags.length > 0 && <DropdownMenuSeparator />}

				<DropdownMenuLabel className={menuHeaderClassName}>
					<SellIcon /> {t('Available')}
				</DropdownMenuLabel>

				{tags &&
					tags
						.filter((item) => !isTagSelected(item))
						.slice(0, 10)
						.map((tag) => (
							<DropdownMenuItem
								onSelect={(event) => {
									// The menu stays open, so several tags can be changed
									event.preventDefault();
									doCreateChatTagging(tag);
								}}
								key={tag.id}
							>
								<SellIcon
									style={{
										fill: tag.web_inbox_color,
									}}
								/>
								{tag.name}
							</DropdownMenuItem>
						))}
				<DropdownMenuSeparator />

				<CreateTagControl
					doCreateTag={doCreateTag}
					stopMenuKeyDownPropagation
					trigger={(openForm) => (
						<DropdownMenuItem
							onSelect={(event) => {
								// Keep the menu open: the form replaces this item
								event.preventDefault();
								openForm();
							}}
						>
							<AddIcon />
							{t('Create new tag')}
						</DropdownMenuItem>
					)}
				/>

				<DropdownMenuSeparator />
				{tags && tags.length > 10 && (
					<DropdownMenuItem onSelect={showChatTagsList}>
						<UnfoldMoreIcon />
						{t('More')}
					</DropdownMenuItem>
				)}
				<DropdownMenuItem asChild className="text-inherit no-underline">
					<a
						href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
						target="_blank"
					>
						<SettingsIcon />
						{t('Manage tags')}
					</a>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default TagsChip;
