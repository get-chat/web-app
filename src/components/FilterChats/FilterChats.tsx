import React from 'react';
import { Chip, Divider, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useFilterChats from '@src/components/FilterChats/useFilterChats';
import PersonIcon from '@mui/icons-material/Person';

interface Props {
	showChatTagsList: () => void;
}

const FilterChats: React.FC<Props> = ({ showChatTagsList }) => {
	const { t } = useTranslation();

	const { displayMenu, hideMenu, menuAnchorEl, showTags } = useFilterChats({
		showChatTagsList,
	});

	return (
		<>
			<Menu
				anchorEl={menuAnchorEl}
				keepMounted
				open={Boolean(menuAnchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<MenuItem>{t('Assigned to me')}</MenuItem>
				<MenuItem>{t('Assigned to group')}</MenuItem>
				<Divider />
				<MenuItem onClick={showTags}>{t('Filter chats by tag')}</MenuItem>
			</Menu>
		</>
	);
};

export default FilterChats;
