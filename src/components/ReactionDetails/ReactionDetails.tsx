import React from 'react';
import useReactions from '@src/hooks/useReactions';
import PrintMessage from '@src/components/PrintMessage';
import Moment from 'react-moment';
import { CALENDAR_SHORT } from '@src/Constants';
import { Message } from '@src/types/messages';
import { getSenderName } from '@src/helpers/MessageHelper';
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

export type Props = {
	message: Message | undefined;
	reactionsHistory: Message[];
	anchorElement: HTMLElement | undefined;
	setAnchorElement: (anchorElement: HTMLElement | undefined) => void;
};

const ReactionDetails: React.FC<Props> = ({
	message,
	reactionsHistory,
	anchorElement,
	setAnchorElement,
}) => {
	const { reactions, reactionsWithCount } = useReactions({
		reactionsHistory,
	});

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
					'w-auto overflow-y-auto rounded-[10px] px-2.5 py-[13px]'
				)}
				// Focus the panel, not the first thing in it, as MUI's Menu did
				onOpenAutoFocus={(event: Event) => {
					event.preventDefault();
					contentRef.current?.focus();
				}}
			>
				<div className="flex max-w-full min-w-[150px] flex-col gap-2.5">
					{reactions
						?.filter((item) => !!item.waba_payload?.reaction?.emoji)
						.map((reaction) => (
							<div className="flex flex-col justify-start" key={reaction.id}>
								<div className="truncate text-[12px]">
									{getSenderName(reaction)}
								</div>
								<div className="mb-1.25 text-[length:x-small] text-ink/60">
									<Moment
										date={reaction.waba_payload?.timestamp}
										calendar={CALENDAR_SHORT}
										unix
									/>
								</div>
								<PrintMessage
									message={reaction.waba_payload?.reaction?.emoji ?? ''}
									smallEmoji
								/>
							</div>
						))}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ReactionDetails;
