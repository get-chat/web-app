// @ts-nocheck
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ChatMessageModel from '@src/api/models/ChatMessageModel';

function ChatMessageOptionsMenu(props) {
	const { t } = useTranslation();

	const isVideoOrTemplateWithVideo = () => {
		return Boolean(props.data?.videoLink);
	};

	const createSavedResponse = () => {
		if (props.optionsChatMessage) {
			props.createSavedResponse(props.optionsChatMessage.text);
		}

		hideMenu();
	};

	const downloadVideo = () => {
		console.log('TODO: Implement!');
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
			{isVideoOrTemplateWithVideo && (
				<MenuItem onClick={downloadVideo}>{t('Download')}</MenuItem>
			)}
		</Menu>
	);
}

export default ChatMessageOptionsMenu;
