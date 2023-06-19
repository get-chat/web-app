import React from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';
import styles from './FilterChats.module.css';
import useFilterChats from '@src/components/FilterChats/useFilterChats';

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
			<Tooltip title={t('Filter chats')} disableInteractive>
				<IconButton
					onClick={displayMenu}
					size="small"
					className={styles.filterButton}
				>
					<FilterListIcon />
				</IconButton>
			</Tooltip>

			<Menu
				anchorEl={menuAnchorEl}
				keepMounted
				open={Boolean(menuAnchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<MenuItem onClick={showTags}>{t('Filter chats by tag')}</MenuItem>
			</Menu>
		</>
	);
};

export default FilterChats;
