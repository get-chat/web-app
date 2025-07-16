import React, { MouseEvent, useContext, useState } from 'react';
import * as Styled from './TagsChip.styles';
import { Divider, Link, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useAppSelector } from '@src/store/hooks';
import { Tag } from '@src/types/tags';
import SellIcon from '@mui/icons-material/Sell';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { getHubURL } from '@src/helpers/URLHelper';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '@src/components/CustomAvatar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';

interface Props {
	selectedTags: Tag[];
	showChatTagsList: () => void;
}

const TagsChip: React.FC<Props> = ({ selectedTags, showChatTagsList }) => {
	const tags = useAppSelector((state) => state.tags.value);
	const [tagsMenuAnchorEl, setTagsMenuAnchorEl] = useState<Element>();
	const config = useContext(AppConfigContext);

	const { t } = useTranslation();

	const isTagSelected = (tag: Tag): boolean => {
		return selectedTags.some((t) => t.id === tag.id);
	};

	return (
		<>
			<Styled.Container
				$isClickable={true}
				onClick={(event: MouseEvent) => {
					if (event.currentTarget instanceof Element) {
						setTagsMenuAnchorEl(event.currentTarget);
					}
				}}
			>
				<Styled.Avatar
					as={CustomAvatar}
					iconColor={selectedTags[0]?.web_inbox_color}
				>
					<SellIcon />
				</Styled.Avatar>

				<Styled.Label>
					{selectedTags.length > 0
						? selectedTags
								.slice(0, 3)
								.map((tag) => tag.name)
								.join(', ')
						: 'Tags'}
				</Styled.Label>

				<Styled.ActionIcon size="small">
					<ExpandMoreIcon />
				</Styled.ActionIcon>
			</Styled.Container>

			<Menu
				anchorEl={tagsMenuAnchorEl}
				open={Boolean(tagsMenuAnchorEl)}
				onClose={() => setTagsMenuAnchorEl(undefined)}
				elevation={3}
			>
				<Styled.MenuHeader>
					<CheckIcon /> {t('Selected')}
				</Styled.MenuHeader>

				{selectedTags.map((tag, index) => (
					<Styled.TagMenuItem
						onClick={() => {
							//dispatch(setFilterTagId(tag.id));
							setTagsMenuAnchorEl(undefined);
						}}
						selected={true}
						key={tag.id}
						$isSelected={true}
					>
						<ListItemIcon>
							<SellIcon
								style={{
									fill: tag.web_inbox_color,
								}}
							/>
						</ListItemIcon>
						{tag.name}
					</Styled.TagMenuItem>
				))}

				{selectedTags.length > 0 && <Divider />}

				<Styled.MenuHeader>
					<SellIcon /> {t('Available')}
				</Styled.MenuHeader>

				{tags &&
					tags
						.filter((item) => !isTagSelected(item))
						.slice(0, 10)
						.map((tag) => (
							<Styled.TagMenuItem
								onClick={() => {
									//dispatch(setFilterTagId(tag.id));
									setTagsMenuAnchorEl(undefined);
								}}
								key={tag.id}
							>
								<ListItemIcon>
									<SellIcon
										style={{
											fill: tag.web_inbox_color,
										}}
									/>
								</ListItemIcon>
								{tag.name}
							</Styled.TagMenuItem>
						))}
				<Divider />
				{tags && tags.length > 10 && (
					<MenuItem
						onClick={() => {
							showChatTagsList();
							setTagsMenuAnchorEl(undefined);
						}}
					>
						<ListItemIcon>
							<UnfoldMoreIcon />
						</ListItemIcon>
						{t('More')}
					</MenuItem>
				)}
				<MenuItem
					component={Link}
					href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
					target="_blank"
				>
					<ListItemIcon>
						<SettingsIcon />
					</ListItemIcon>
					{t('Manage tags')}
				</MenuItem>
			</Menu>
		</>
	);
};

export default TagsChip;
