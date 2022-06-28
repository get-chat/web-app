import React from 'react';
import { Menu, MenuItem } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

function ChatMessageOptionsMenu(props) {
	const { t, i18n } = useTranslation();

	const createSavedResponse = () => {
		if (props.optionsChatMessage) {
			props.createSavedResponse(props.optionsChatMessage.text);
		}

		hideMenu();
	};

	const hideMenu = () => {
		props.setMenuAnchorEl(null);
	};

	return (
		<Menu
			anchorEl={props.menuAnchorEl}
			getContentAnchorEl={null}
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
				props.optionsChatMessage.type === 'text' &&
				props.optionsChatMessage.isFromUs && (
					<MenuItem onClick={createSavedResponse}>
						{t('Save this response')}
					</MenuItem>
				)}
		</Menu>
	);
}

export default ChatMessageOptionsMenu;
