import React from 'react';
import LaunchIcon from '@src/components/icons/OpenInNew';
import ReplyIcon from '@src/components/icons/Reply';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import { CarouselCard } from '@src/types/messages';

// The card's image or video fills its media area
const mediaClassName = 'block size-full object-cover';

const CarouselMessage: React.FC<InteractiveMessageProps> = ({
	interactive,
}) => {
	const { body, action } = interactive ?? {};
	const cards = action?.cards;

	const renderMedia = (card: CarouselCard) => {
		const header = card.header;
		const link = header?.[header?.type]?.link;
		if (!link) return null;

		return (
			<div className="h-[110px] bg-ink/5">
				{header?.type === 'video' ? (
					<video
						className={mediaClassName}
						src={link}
						controls
						preload="metadata"
					/>
				) : (
					<img className={mediaClassName} src={link} alt="" />
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-1.25">
			{body && (
				<div className="font-normal">
					<PrintMessage linkify message={body.text} />
				</div>
			)}

			{cards && Array.isArray(cards) && (
				<div className="flex gap-2 overflow-x-auto pb-1.25">
					{cards.map((card, cardIndex) => (
						<div
							className="flex w-50 shrink-0 flex-col overflow-hidden rounded-[10px] border border-ink/10"
							key={cardIndex}
						>
							{renderMedia(card)}
							{card.body?.text && (
								<div className="px-2 py-1.25 text-[0.9em] whitespace-pre-wrap">
									<PrintMessage linkify message={card.body.text} />
								</div>
							)}
							<div className="mt-auto flex flex-col">
								{card.action?.name === 'cta_url' && (
									<InteractiveMessageButton
										href={card.action?.parameters?.url}
										disabled
									>
										<LaunchIcon />
										{card.action?.parameters?.display_text}
									</InteractiveMessageButton>
								)}
								{card.action?.buttons &&
									Array.isArray(card.action.buttons) &&
									card.action.buttons.map(({ reply }, buttonIndex) => (
										<InteractiveMessageButton key={buttonIndex} disabled>
											<ReplyIcon />
											{reply?.title}
										</InteractiveMessageButton>
									))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default CarouselMessage;
