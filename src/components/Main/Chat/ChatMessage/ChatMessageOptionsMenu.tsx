import React, { useMemo } from 'react';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { download } from '@src/helpers/DownloadHelper';
import DownloadIcon from '@mui/icons-material/Download';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import { Message, MessageType } from '@src/types/messages';
import {
	generateAudioLink,
	generateVideoLink,
} from '@src/helpers/MessageHelper';

interface Props {
	optionsChatMessage?: Message | undefined;
	menuAnchorEl?: Element | undefined;
	setMenuAnchorEl: (anchorEl: HTMLElement | undefined) => void;
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
		if (!optionsChatMessage) return false;
		return Boolean(generateVideoLink(optionsChatMessage, true));
	}, [optionsChatMessage]);

	const hasAudio = useMemo(() => {
		if (!optionsChatMessage) return false;
		return Boolean(generateAudioLink(optionsChatMessage));
	}, [optionsChatMessage]);

	const handleCreateSavedResponse = () => {
		if (optionsChatMessage?.waba_payload?.text?.body) {
			createSavedResponse(optionsChatMessage?.waba_payload.text.body);
		}

		hideMenu();
	};

	const downloadVideo = () => {
		const data = {
			source: optionsChatMessage
				? generateVideoLink(optionsChatMessage, true)
				: undefined,
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
			source: optionsChatMessage
				? generateAudioLink(optionsChatMessage)
				: undefined,
		};
		if (!data.source) {
			hideMenu();
			return;
		}
		download(data);
		hideMenu();
	};

	const hideMenu = () => {
		setMenuAnchorEl(undefined);
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
				optionsChatMessage.waba_payload?.type === MessageType.text &&
				optionsChatMessage.from_us && (
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
