import React from 'react';
import PrintMessage from '@src/components/PrintMessage';
import AddIcon from '@mui/icons-material/Add';
import { Message } from '@src/types/messages';
import { Popover, PopoverAnchor } from '@src/components/ui/popover';
import { useCenteredOverAnchor } from './useCenteredOverAnchor';
import * as Styled from './QuickReactionsMenu.styles';

interface Props {
	message: Message | undefined;
	anchorElement: HTMLElement | undefined;
	setAnchorElement: (anchorElement: HTMLElement | undefined) => void;
	setEmojiPickerAnchorElement: (anchorElement: HTMLElement | undefined) => void;
	onReaction: (messageId: string, emoji: string | null) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const QuickReactionsMenu: React.FC<Props> = ({
	message,
	anchorElement,
	setAnchorElement,
	setEmojiPickerAnchorElement,
	onReaction,
}) => {
	const hide = () => {
		setAnchorElement(undefined);
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
				// Focus the panel, not the first thing in it, as MUI's Menu did
				onOpenAutoFocus={(event: Event) => {
					event.preventDefault();
					contentRef.current?.focus();
				}}
			>
				<Styled.ReactionsContainer>
					{EMOJIS.map((emoji) => (
						<div
							key={emoji}
							onClick={() => {
								if (message?.waba_payload?.id) {
									onReaction(message.waba_payload.id, emoji);
								}
								hide();
							}}
						>
							<PrintMessage message={emoji} smallEmoji />
						</div>
					))}
					<div
						onClick={() => {
							setEmojiPickerAnchorElement(anchorElement);
							hide();
						}}
					>
						<AddIcon />
					</div>
				</Styled.ReactionsContainer>
			</Styled.Content>
		</Popover>
	);
};

export default QuickReactionsMenu;
