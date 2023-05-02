// @ts-nocheck
import React, { useMemo } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { download } from '@src/helpers/DownloadHelper';

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
			keepMounted
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
						{t('Save this response')}
					</MenuItem>
				)}
			{hasVideo && <MenuItem onClick={downloadVideo}>{t('Download')}</MenuItem>}
		</Menu>
	);
}

export default ChatMessageOptionsMenu;
