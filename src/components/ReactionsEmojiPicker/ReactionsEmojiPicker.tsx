import React from 'react';
// @ts-ignore
import { Emoji, NimblePicker } from 'emoji-mart';
import { EMOJI_SET, EMOJI_SHEET_SIZE } from '@src/Constants';
import data from 'emoji-mart/data/facebook.json';
import { Message } from '@src/types/messages';
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from '@src/components/ui/popover';
import {
	overMessageShadowClassName,
	useCenteredOverAnchor,
} from '@src/components/QuickReactionsMenu/useCenteredOverAnchor';
import { cn } from '@src/lib/utils';

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
			<PopoverContent
				ref={contentRef}
				{...contentProps}
				className={cn(
					contentProps.className,
					overMessageShadowClassName,
					'w-[427px] overflow-y-auto rounded-[10px] p-0',
					// No transition, as before
					'data-[state=closed]:animate-none data-[state=open]:animate-none'
				)}
				// Focus the panel, not the first thing in it, as MUI's Menu did
				onOpenAutoFocus={(event: Event) => {
					event.preventDefault();
					contentRef.current?.focus();
				}}
			>
				<div className="relative">
					<NimblePicker
						set={EMOJI_SET}
						sheetSize={EMOJI_SHEET_SIZE}
						data={data}
						showPreview={false}
						emojiSize={32}
						onSelect={handleEmojiSelect}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ReactionsEmojiPicker;
