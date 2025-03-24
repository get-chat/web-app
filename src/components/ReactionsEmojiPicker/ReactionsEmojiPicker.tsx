import React from 'react';
import styles from './ReactionsEmojiPicker.module.css';
import { Menu } from '@mui/material';
// @ts-ignore
import { Emoji, NimblePicker } from 'emoji-mart';
import { EMOJI_SET, EMOJI_SHEET_SIZE } from '@src/Constants';
import data from 'emoji-mart/data/facebook.json';
import { Message } from '@src/types/messages';

interface Props {
	message: Message | undefined;
	anchorElement: HTMLElement | undefined;
	setAnchorElement: (anchorElement: HTMLElement | undefined) => void;
	onReaction: (messageId: string, emoji: string | null) => void;
}

const ReactionsEmojiPicker: React.FC<Props> = ({
	message,
	anchorElement,
	setAnchorElement,
	onReaction,
}) => {
	const hide = () => {
		setAnchorElement(undefined);
	};

	const handleEmojiSelect = (emoji: Emoji | null) => {
		if (emoji && message?.waba_payload?.id) {
			onReaction(message.waba_payload.id, emoji.native);
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
			onClose={() => setAnchorElement(undefined)}
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
