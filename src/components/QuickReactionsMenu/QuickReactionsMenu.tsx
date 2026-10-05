import React from 'react';
import PrintMessage from '@src/components/PrintMessage';
import AddIcon from '@src/components/icons/Add';
import { Message } from '@src/types/messages';
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from '@src/components/ui/popover';
import {
	overMessageShadowClassName,
	useCenteredOverAnchor,
} from './useCenteredOverAnchor';
import { cn } from '@src/lib/utils';

interface Props {
	message: Message | undefined;
	anchorElement: HTMLElement | undefined;
	setAnchorElement: (anchorElement: HTMLElement | undefined) => void;
	setEmojiPickerAnchorElement: (anchorElement: HTMLElement | undefined) => void;
	onReaction: (messageId: string, emoji: string | null) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// Each choice grows a little on hover
const choiceClassName =
	'cursor-pointer transition-all duration-200 ease-out hover:scale-120';

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
			{/* The vertical padding includes the 8px MUI's Menu put inside */}
			<PopoverContent
				ref={contentRef}
				{...contentProps}
				className={cn(
					contentProps.className,
					overMessageShadowClassName,
					'w-auto rounded-[40px] px-3 py-2.5'
				)}
				// Focus the panel, not the first thing in it, as MUI's Menu did
				onOpenAutoFocus={(event: Event) => {
					event.preventDefault();
					contentRef.current?.focus();
				}}
			>
				<div className="flex gap-2.5">
					{EMOJIS.map((emoji) => (
						<div
							key={emoji}
							className={choiceClassName}
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
						className={choiceClassName}
						onClick={() => {
							setEmojiPickerAnchorElement(anchorElement);
							hide();
						}}
					>
						<AddIcon />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default QuickReactionsMenu;
