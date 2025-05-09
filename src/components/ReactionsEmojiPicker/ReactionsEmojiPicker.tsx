import React from 'react';
// @ts-ignore
import { Emoji, NimblePicker } from 'emoji-mart';
import { EMOJI_SET, EMOJI_SHEET_SIZE } from '@src/Constants';
import data from 'emoji-mart/data/facebook.json';
import { Message } from '@src/types/messages';
import * as Styled from './ReactionsEmojiPicker.styles';

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
		<Styled.StyledMenu
			transitionDuration={0}
			anchorEl={anchorElement}
			anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
			transformOrigin={{ vertical: 'center', horizontal: 'center' }}
			open={Boolean(anchorElement)}
			onClose={() => setAnchorElement(undefined)}
			elevation={0}
			disableAutoFocusItem={true}
		>
			<Styled.EmojiPickerContainer>
				<NimblePicker
					set={EMOJI_SET}
					sheetSize={EMOJI_SHEET_SIZE}
					data={data}
					showPreview={false}
					emojiSize={32}
					onSelect={handleEmojiSelect}
				/>
			</Styled.EmojiPickerContainer>
		</Styled.StyledMenu>
	);
};

export default ReactionsEmojiPicker;
