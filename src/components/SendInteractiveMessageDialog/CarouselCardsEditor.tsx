import React, { useRef, useState } from 'react';
import { Button, CircularProgress, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { CarouselCard } from '@src/types/messages';
import { isEmptyString } from '@src/helpers/Helpers';
import { createMedia } from '@src/api/mediaApi';
import * as Styled from './CarouselCardsEditor.styles';

// Limits imposed by the WhatsApp Business API for media carousel messages
export const MIN_CAROUSEL_CARDS = 2;
const MAX_CAROUSEL_CARDS = 10;
const CARD_BODY_MAX_LENGTH = 160;
const BUTTON_LABEL_MAX_LENGTH = 20;

const ACCEPTED_MEDIA_TYPES = 'image/jpeg, image/png, video/mp4, video/3gpp';

// WhatsApp rejects the message asynchronously when the media exceeds
// its size limits, so check the file before uploading it
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 16 * 1024 * 1024;

export const getCardMediaLink = (card: CarouselCard): string =>
	card.header?.[card.header?.type]?.link ?? '';

interface Props {
	cards: CarouselCard[];
	onChange: (cards: CarouselCard[]) => void;
	isShowErrors: boolean;
}

const CarouselCardsEditor: React.FC<Props> = ({
	cards,
	onChange,
	isShowErrors,
}) => {
	const { t } = useTranslation();

	const fileInputRef = useRef<HTMLInputElement>(null);
	// The card the file picker was opened for; becomes the uploading card
	// only once a file is chosen (picking may be cancelled silently)
	const uploadTargetIndexRef = useRef<number>();
	// Cards are referred to by index, so only one upload runs at a time
	const [uploadingCardIndex, setUploadingCardIndex] = useState<number>();
	const isUploading = uploadingCardIndex !== undefined;

	// The upload completes asynchronously; applying its result to the latest
	// cards avoids discarding the edits made while it was in flight
	const cardsRef = useRef(cards);
	cardsRef.current = cards;

	const emptyCard = (): CarouselCard => ({
		type: 'cta_url',
		header: { type: 'image', image: { link: '' } },
		body: { text: '' },
		action: {
			name: 'cta_url',
			parameters: { display_text: '', url: '' },
		},
	});

	const replaceCard = (index: number, card: CarouselCard) =>
		onChange(cards.map((item, i) => (i === index ? card : item)));

	const setActionParameter = (
		card: CarouselCard,
		key: string,
		value: string
	): CarouselCard => ({
		...card,
		action: {
			...card.action,
			name: card.action?.name ?? 'cta_url',
			parameters: { ...card.action?.parameters, [key]: value },
		},
	});

	const uploadMedia = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		// Allow choosing the same file again later
		event.target.value = '';

		const cardIndex = uploadTargetIndexRef.current;
		uploadTargetIndexRef.current = undefined;
		if (!file || cardIndex === undefined) return;

		const headerType = file.type.startsWith('video/') ? 'video' : 'image';

		const maxSizeBytes =
			headerType === 'video' ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
		if (file.size > maxSizeBytes) {
			window.displayCustomError(
				headerType === 'video'
					? 'Video files must be smaller than 16 MB.'
					: 'Image files must be smaller than 5 MB.'
			);
			return;
		}

		const formData = new FormData();
		formData.append('file_encoded', file);

		setUploadingCardIndex(cardIndex);
		try {
			const data = await createMedia(formData);
			onChange(
				cardsRef.current.map((item, i) =>
					i === cardIndex
						? {
								...item,
								header: { type: headerType, [headerType]: { link: data.file } },
						  }
						: item
				)
			);
		} catch (error: any | AxiosError) {
			console.error(error);
			if (error?.response?.status === 413) {
				window.displayCustomError('The media file is too big to upload!');
			} else {
				window.displayError(error);
			}
		} finally {
			setUploadingCardIndex(undefined);
		}
	};

	return (
		<Styled.Container>
			{cards.map((card, cardIndex) => (
				<Styled.Card key={cardIndex}>
					<Styled.CardHeader>
						{t('Card %s', { postProcess: 'sprintf', sprintf: [cardIndex + 1] })}
						<IconButton
							size="small"
							aria-label={t('Remove card')}
							disabled={cards.length <= MIN_CAROUSEL_CARDS || isUploading}
							onClick={() => onChange(cards.filter((_, i) => i !== cardIndex))}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Styled.CardHeader>

					<Styled.FieldRow>
						<Button
							size="small"
							startIcon={
								uploadingCardIndex === cardIndex ? (
									<CircularProgress size={16} />
								) : (
									<CloudUploadIcon />
								)
							}
							disabled={isUploading}
							onClick={() => {
								uploadTargetIndexRef.current = cardIndex;
								fileInputRef.current?.click();
							}}
						>
							{t(
								isEmptyString(getCardMediaLink(card))
									? 'Upload image or video'
									: 'Replace media'
							)}
						</Button>
						{isShowErrors && isEmptyString(getCardMediaLink(card)) && (
							<Styled.ErrorText>{t('Media is required')}</Styled.ErrorText>
						)}
					</Styled.FieldRow>

					<Styled.FieldRow>
						<TextField
							variant="standard"
							size="small"
							fullWidth
							multiline
							label={t('Card body')}
							value={card.body?.text ?? ''}
							inputProps={{ maxLength: CARD_BODY_MAX_LENGTH }}
							onChange={(e) =>
								replaceCard(cardIndex, {
									...card,
									body: { text: e.target.value },
								})
							}
						/>
					</Styled.FieldRow>

					<Styled.FieldRow>
						<TextField
							variant="standard"
							size="small"
							fullWidth
							label={t('Button text')}
							value={card.action?.parameters?.display_text ?? ''}
							required
							error={
								isShowErrors &&
								isEmptyString(card.action?.parameters?.display_text ?? '')
							}
							inputProps={{ maxLength: BUTTON_LABEL_MAX_LENGTH }}
							onChange={(e) =>
								replaceCard(
									cardIndex,
									setActionParameter(card, 'display_text', e.target.value)
								)
							}
						/>
						<TextField
							variant="standard"
							size="small"
							fullWidth
							label={t('Button URL')}
							value={card.action?.parameters?.url ?? ''}
							required
							error={
								isShowErrors &&
								isEmptyString(card.action?.parameters?.url ?? '')
							}
							onChange={(e) =>
								replaceCard(
									cardIndex,
									setActionParameter(card, 'url', e.target.value)
								)
							}
						/>
					</Styled.FieldRow>
				</Styled.Card>
			))}

			<Button
				size="small"
				startIcon={<AddIcon />}
				disabled={cards.length >= MAX_CAROUSEL_CARDS}
				onClick={() => onChange([...cards, emptyCard()])}
			>
				{t('Add card')}
			</Button>

			<input
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_MEDIA_TYPES}
				style={{ display: 'none' }}
				onChange={uploadMedia}
			/>
		</Styled.Container>
	);
};

export default CarouselCardsEditor;
