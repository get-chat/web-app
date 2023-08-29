// @ts-nocheck
import React, { useMemo } from 'react';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { download } from '@src/helpers/DownloadHelper';
import DownloadIcon from '@mui/icons-material/Download';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';

function ChatMessageOptionsMenu({
	optionsChatMessage,
	menuAnchorEl,
	setMenuAnchorEl,
	createSavedResponse,
}) {
	const { t } = useTranslation();

	const hasVideo = useMemo(() => {
		return Boolean(optionsChatMessage?.generateVideoLink(true));
	}, [optionsChatMessage]);

	const handleCreateSavedResponse = () => {
		if (optionsChatMessage) {
			createSavedResponse(optionsChatMessage.text);
		}

		hideMenu();
	};

	const downloadVideo = () => {
		const data = {
			source: optionsChatMessage?.generateVideoLink(true),
		};
		if (!data.source) {
			hideMenu();
			return;
		}
		download(data);
		hideMenu();
	};

	const hideMenu = () => {
		setMenuAnchorEl(null);
	};

	return (
		<Menu
			anchorEl={menuAnchorEl}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			open={Boolean(menuAnchorEl)}
			onClose={hideMenu}
			elevation={3}
			disableAutoFocusItem={true}
		>
			{/*<MenuItem>Delete</MenuItem>*/}

			{optionsChatMessage &&
				optionsChatMessage.type === ChatMessageModel.TYPE_TEXT &&
				optionsChatMessage.isFromUs && (
					<MenuItem onClick={handleCreateSavedResponse}>
						<ListItemIcon>
							<MarkChatReadIcon />
						</ListItemIcon>
						{t('Save as quick reply')}
					</MenuItem>
				)}
			{hasVideo && (
				<MenuItem onClick={downloadVideo}>
					<ListItemIcon>
						<DownloadIcon />
					</ListItemIcon>
					{t('Download')}
				</MenuItem>
			)}
		</Menu>
	);
}

export default ChatMessageOptionsMenu;
