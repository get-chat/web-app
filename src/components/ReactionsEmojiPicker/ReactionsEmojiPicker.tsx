import ChatMessageModel from '@src/api/models/ChatMessageModel';
import React from 'react';
import styles from './ReactionsEmojiPicker.module.css';
import { Menu } from '@mui/material';
// @ts-ignore
import { Emoji, NimblePicker } from 'emoji-mart';
import { EMOJI_SET, EMOJI_SHEET_SIZE } from '@src/Constants';
import data from 'emoji-mart/data/facebook.json';

interface Props {
	message: ChatMessageModel | null;
	anchorElement: HTMLElement | null;
	setAnchorElement: (anchorElement: HTMLElement | null) => void;
	onReaction: (messageId: string, emoji: string | null) => void;
}

const ReactionsEmojiPicker: React.FC<Props> = ({
	message,
	anchorElement,
	setAnchorElement,
	onReaction,
}) => {
	const hide = () => {
		setAnchorElement(null);
	};

	const handleEmojiSelect = (emoji: Emoji | null) => {
		if (emoji && message?.id) {
			onReaction(message.id, emoji.native);
		}

		hide();
	};

	return (
		<Menu
			transitionDuration={0}
			anchorEl={anchorElement}
			anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
			transformOrigin={{ vertical: 'center', horizontal: 'center' }}
			open={Boolean(anchorElement)}
			onClose={() => setAnchorElement(null)}
			elevation={0}
			disableAutoFocusItem={true}
			className={styles.menu}
		>
			<div className={styles.emojiPicker}>
				<NimblePicker
					set={EMOJI_SET}
					sheetSize={EMOJI_SHEET_SIZE}
					data={data}
					showPreview={false}
					emojiSize={32}
					onSelect={handleEmojiSelect}
				/>
			</div>
		</Menu>
	);
};

export default ReactionsEmojiPicker;
