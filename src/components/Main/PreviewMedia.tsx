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
import { cn } from '@src/lib/utils';

// MUI's large IconButton, 44px on mobile as App.css made it
const headerButtonClassName = 'max-md:size-11';

const mediaClassName =
	'max-h-full max-w-full self-center rounded-[10px] bg-white';

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

	// Clicking around the media, not on it, closes the preview
	const handleClick = (event: React.MouseEvent) => {
		if (event.target === event.currentTarget) {
			hideImageOrVideoPreview();
		}
	};

	return (
		<div className="absolute inset-0 z-99 flex flex-col items-center bg-white/80 backdrop-blur-[12px]">
			<div className="flex h-(--header-height) w-full items-center justify-between bg-white px-3.75 py-1 shadow-md max-md:px-2.5">
				<SimpleTooltip title={t('Close')} disableHoverableContent>
					<Button
						variant="ghost"
						color="neutral"
						size="icon-xl"
						className={headerButtonClassName}
						onClick={hideImageOrVideoPreview}
					>
						<CloseIcon />
					</Button>
				</SimpleTooltip>

				<CustomAvatar className="ml-1.25" generateBgColorBy={data.senderName}>
					{data.initials}
				</CustomAvatar>

				<div className="flex-[1_1] pl-3.75">
					<h3 className="mb-0 text-[16px]">{data.senderName}</h3>
					<span className="block text-[12px] text-ink/60">
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
				className="flex w-[-webkit-fill-available] w-[-moz-available] flex-[1_1] animate-in content-center items-center justify-center overflow-hidden p-7.5 zoom-in duration-225 max-md:p-2.5"
				onClick={handleClick}
			>
				{data.type === ATTACHMENT_TYPE_IMAGE && (
					<Image
						className={cn(mediaClassName, 'cursor-zoom-in')}
						src={data.source}
						alt="Preview"
						onClick={() => setZoomEnabled(true)}
					/>
				)}
				{data.type === ATTACHMENT_TYPE_VIDEO && (
					<video
						className={mediaClassName}
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
