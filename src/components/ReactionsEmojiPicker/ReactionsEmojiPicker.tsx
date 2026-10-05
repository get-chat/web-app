import React from 'react';
// @ts-ignore
import { Emoji, NimblePicker } from 'emoji-mart';
import { EMOJI_SET, EMOJI_SHEET_SIZE } from '@src/Constants';
import data from 'emoji-mart/data/facebook.json';
import { Message } from '@src/types/messages';
import { Popover, PopoverAnchor } from '@src/components/ui/popover';
import { useCenteredOverAnchor } from '@src/components/QuickReactionsMenu/useCenteredOverAnchor';
import { cn } from '@src/lib/utils';
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

	const { virtualRef, contentRef, contentProps } =
		useCenteredOverAnchor(anchorElement);

	return (
		<Popover
			open={Boolean(anchorElement)}
			onOpenChange={(isOpen) => !isOpen && setAnchorElement(undefined)}
		>
			<PopoverAnchor virtualRef={virtualRef} />
			<Styled.Content
				ref={contentRef}
				{...contentProps}
				// No transition, as before
				className={cn(
					contentProps.className,
					'data-[state=closed]:animate-none data-[state=open]:animate-none'
				)}
				// Focus the panel, not the first thing in it, as MUI's Menu did
				onOpenAutoFocus={(event: Event) => {
					event.preventDefault();
					contentRef.current?.focus();
				}}
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
			</Styled.Content>
		</Popover>
	);
};

export default ReactionsEmojiPicker;
