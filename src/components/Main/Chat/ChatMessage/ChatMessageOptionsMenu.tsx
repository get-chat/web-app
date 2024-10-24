import React, { useMemo } from 'react';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { download } from '@src/helpers/DownloadHelper';
import DownloadIcon from '@mui/icons-material/Download';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';

interface Props {
	optionsChatMessage?: ChatMessageModel | null;
	menuAnchorEl?: Element | null;
	setMenuAnchorEl: (anchorEl: Element | null) => void;
	createSavedResponse: (text: string) => void;
}

const ChatMessageOptionsMenu: React.FC<Props> = ({
	optionsChatMessage,
	menuAnchorEl,
	setMenuAnchorEl,
	createSavedResponse,
}) => {
	const { t } = useTranslation();

	const hasVideo = useMemo(() => {
		return Boolean(optionsChatMessage?.generateVideoLink(true));
	}, [optionsChatMessage]);

	const hasAudio = useMemo(() => {
		return Boolean(optionsChatMessage?.generateAudioLink());
	}, [optionsChatMessage]);

	const handleCreateSavedResponse = () => {
		if (optionsChatMessage?.text) {
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

	const downloadAudio = () => {
		const data = {
			source: optionsChatMessage?.generateAudioLink(),
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
			anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
			{hasAudio && (
				<MenuItem onClick={downloadAudio}>
					<ListItemIcon>
						<DownloadIcon />
					</ListItemIcon>
					{t('Download')}
				</MenuItem>
			)}
		</Menu>
	);
};

export default ChatMessageOptionsMenu;
