import React from 'react';
import { Button } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import { CarouselCard } from '@src/types/messages';
import * as Styled from './CarouselMessage.styles';

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
			<Styled.CardMedia>
				{header?.type === 'video' ? (
					<video src={link} controls preload="metadata" />
				) : (
					<img src={link} alt="" />
				)}
			</Styled.CardMedia>
		);
	};

	return (
		<Styled.Message>
			{body && (
				<Styled.Body>
					<PrintMessage linkify message={body.text} />
				</Styled.Body>
			)}

			{cards && Array.isArray(cards) && (
				<Styled.Cards>
					{cards.map((card, cardIndex) => (
						<Styled.Card key={cardIndex}>
							{renderMedia(card)}
							{card.body?.text && (
								<Styled.CardBody>
									<PrintMessage linkify message={card.body.text} />
								</Styled.CardBody>
							)}
							<Styled.CardActions>
								{card.action?.name === 'cta_url' && (
									<Button
										color="primary"
										fullWidth
										startIcon={<LaunchIcon />}
										href={card.action?.parameters?.url}
										disabled
									>
										{card.action?.parameters?.display_text}
									</Button>
								)}
								{card.action?.buttons &&
									Array.isArray(card.action.buttons) &&
									card.action.buttons.map(({ reply }, buttonIndex) => (
										<Button
											key={reply?.id ?? buttonIndex}
											color="primary"
											fullWidth
											disabled
										>
											{reply?.title}
										</Button>
									))}
							</Styled.CardActions>
						</Styled.Card>
					))}
				</Styled.Cards>
			)}
		</Styled.Message>
	);
};

export default CarouselMessage;
