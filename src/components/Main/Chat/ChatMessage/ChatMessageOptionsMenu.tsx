import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { download } from '@src/helpers/DownloadHelper';
import DownloadIcon from '@src/components/icons/Download';
import MarkChatReadIcon from '@src/components/icons/MarkChatRead';
import { Message, MessageType } from '@src/types/messages';
import {
	generateAudioLink,
	generateVideoLink,
} from '@src/helpers/MessageHelper';
import {
	AnchoredDropdownMenu,
	DropdownMenuItem,
} from '@src/components/ui/dropdown-menu';

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
		<AnchoredDropdownMenu
			anchorEl={menuAnchorEl}
			onClose={hideMenu}
			align="end"
		>
			{/*<DropdownMenuItem>Delete</DropdownMenuItem>*/}

			{optionsChatMessage &&
				optionsChatMessage.waba_payload?.type === MessageType.text &&
				optionsChatMessage.from_us && (
					<DropdownMenuItem onSelect={handleCreateSavedResponse}>
						<MarkChatReadIcon />
						{t('Save as quick reply')}
					</DropdownMenuItem>
				)}
			{hasVideo && (
				<DropdownMenuItem onSelect={downloadVideo}>
					<DownloadIcon />
					{t('Download')}
				</DropdownMenuItem>
			)}
			{hasAudio && (
				<DropdownMenuItem onSelect={downloadAudio}>
					<DownloadIcon />
					{t('Download')}
				</DropdownMenuItem>
			)}
		</AnchoredDropdownMenu>
	);
};

export default ChatMessageOptionsMenu;
