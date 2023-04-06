// @ts-nocheck
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { download } from '@src/helpers/DowloadHelper';

function ChatMessageOptionsMenu(props) {
	const { t } = useTranslation();

	const hasVideo = () => {
		return Boolean(props.data?.getAnyVideo());
	};

	const createSavedResponse = () => {
		if (props.optionsChatMessage) {
			props.createSavedResponse(props.optionsChatMessage.text);
		}

		hideMenu();
	};

	const downloadVideo = () => {
		const data = {
			source: props.optionsChatMessage?.getAnyVideo(),
		};
		if (!data.source) {
			hideMenu();
			return;
		}
		download(data);
		hideMenu();
	};

	const hideMenu = () => {
		props.setMenuAnchorEl(null);
	};

	return (
		<Menu
			anchorEl={props.menuAnchorEl}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			keepMounted
			open={Boolean(props.menuAnchorEl)}
			onClose={hideMenu}
			elevation={3}
			disableAutoFocusItem={true}
		>
			{/*<MenuItem>Delete</MenuItem>*/}

			{props.optionsChatMessage &&
				props.optionsChatMessage.type === ChatMessageModel.TYPE_TEXT &&
				props.optionsChatMessage.isFromUs && (
					<MenuItem onClick={createSavedResponse}>
						{t('Save this response')}
					</MenuItem>
				)}
			{hasVideo && <MenuItem onClick={downloadVideo}>{t('Download')}</MenuItem>}
		</Menu>
	);
}

export default ChatMessageOptionsMenu;
