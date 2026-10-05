import React, { useEffect, useState } from 'react';
import CloseIcon from '@src/components/icons/Close';
import Moment from 'react-moment';
import {
	ATTACHMENT_TYPE_IMAGE,
	ATTACHMENT_TYPE_VIDEO,
	CALENDAR_NORMAL,
	EVENT_TOPIC_CHAT_MESSAGE,
} from '@src/Constants';
import { Download as GetApp } from '@src/components/icons';
import { useTranslation } from 'react-i18next';
import Image from '../Image';
import PreviewMediaZoom from './PreviewMediaZoom';
import PubSub from 'pubsub-js';
import { setPreviewMediaObject } from '@src/store/reducers/previewMediaObjectReducer';
import CustomAvatar from '@src/components/CustomAvatar';
import { download } from '@src/helpers/DownloadHelper';
import { useAppDispatch } from '@src/store/hooks';
import PreviewMediaModel from '@src/api/models/PreviewMediaModel';
import { Button } from '@src/components/ui/button';
import { SimpleTooltip } from '@src/components/ui/tooltip';

// MUI's large IconButton, 44px on mobile as App.css made it
const headerButtonClassName = 'max-md:size-11';

interface Props {
	data: PreviewMediaModel;
}

const PreviewMedia: React.FC<Props> = ({ data }) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const [isZoomEnabled, setZoomEnabled] = useState(false);

	useEffect(() => {
		PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');
	}, []);

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			// Escape
			if (event.key === 'Escape') {
				if (isZoomEnabled) {
					setZoomEnabled(false);
				} else {
					hideImageOrVideoPreview();
				}
			}
		};

		document.addEventListener('keydown', handleKey);

		return () => {
			document.removeEventListener('keydown', handleKey);
		};
	}, [isZoomEnabled]);

	const hideImageOrVideoPreview = () => {
		dispatch(setPreviewMediaObject(undefined));
	};

	const handleClick = (event: React.MouseEvent) => {
		if (
			(event.target as Element).className?.includes(
				'app__mediaPreview__container'
			)
		) {
			hideImageOrVideoPreview();
		}
	};

	return (
		<div className="app__mediaPreview">
			<div className="app__mediaPreview__header">
				<SimpleTooltip title={t('Close')} disableHoverableContent>
					<Button
						variant="ghost"
						color="neutral"
						size="icon-xl"
						className={`app__mediaPreview__close ${headerButtonClassName}`}
						onClick={hideImageOrVideoPreview}
					>
						<CloseIcon />
					</Button>
				</SimpleTooltip>

				<CustomAvatar generateBgColorBy={data.senderName}>
					{data.initials}
				</CustomAvatar>

				<div className="app_imagePreview__header__senderInfo">
					<h3>{data.senderName}</h3>
					<span>
						<Moment calendar={CALENDAR_NORMAL} date={data.timestamp} unix />
					</span>
				</div>

				<SimpleTooltip title={t('Download')} disableHoverableContent>
					<Button
						variant="ghost"
						color="neutral"
						size="icon-xl"
						className={headerButtonClassName}
						onClick={() => download({ source: data.source })}
					>
						<GetApp />
					</Button>
				</SimpleTooltip>
			</div>

			<div
				className="app__mediaPreview__container animate-in zoom-in duration-225"
				onClick={handleClick}
			>
				{data.type === ATTACHMENT_TYPE_IMAGE && (
					<Image
						className="app__mediaPreview__image"
						src={data.source}
						alt="Preview"
						onClick={() => setZoomEnabled(true)}
					/>
				)}
				{data.type === ATTACHMENT_TYPE_VIDEO && (
					<video
						className="app__mediaPreview__video"
						src={data.source}
						controls
						autoPlay={true}
					/>
				)}
			</div>

			{isZoomEnabled && data.type === ATTACHMENT_TYPE_IMAGE && (
				<PreviewMediaZoom
					src={data.source ?? ''}
					onClick={() => setZoomEnabled(false)}
				/>
			)}
		</div>
	);
};

export default PreviewMedia;
