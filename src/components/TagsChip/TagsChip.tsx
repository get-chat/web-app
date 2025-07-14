import React, { MouseEvent, useContext, useState } from 'react';
import * as Styled from './TagsChip.styles';
import { Divider, Link, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { Tag } from '@src/types/tags';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import SellIcon from '@mui/icons-material/Sell';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { getHubURL } from '@src/helpers/URLHelper';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '@src/components/CustomAvatar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Label } from './TagsChip.styles';

interface Props {
	showChatTagsList: () => void;
}

const TagsChip: React.FC<Props> = ({ showChatTagsList }) => {
	const tags = useAppSelector((state) => state.tags.value);
	const [tagsMenuAnchorEl, setTagsMenuAnchorEl] = useState<Element>();
	const config = useContext(AppConfigContext);

	const dispatch = useAppDispatch();

	const { t } = useTranslation();

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
				<Styled.Avatar as={CustomAvatar} unassigned={true}>
					<SellIcon />
				</Styled.Avatar>

				<Styled.Label>Tags</Styled.Label>

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
				{tags &&
					tags.slice(0, 10).map((tag: Tag) => (
						<MenuItem
							onClick={() => {
								dispatch(setFilterTagId(tag.id));
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
						</MenuItem>
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
