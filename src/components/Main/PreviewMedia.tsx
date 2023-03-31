// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, Zoom as ZoomTransition } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Moment from 'react-moment';
import {
	ATTACHMENT_TYPE_IMAGE,
	ATTACHMENT_TYPE_VIDEO,
	CALENDAR_NORMAL,
	EVENT_TOPIC_CHAT_MESSAGE,
} from '@src/Constants';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { GetApp } from '@mui/icons-material';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { generateUniqueID } from '@src/helpers/Helpers';
import { useTranslation } from 'react-i18next';
import { mimeToExtension } from '@src/helpers/ImageHelper';
import Image from '../Image';
import PreviewMediaZoom from './PreviewMediaZoom';
import PubSub from 'pubsub-js';
import { setPreviewMediaObject } from '@src/store/reducers/previewMediaObjectReducer';
import { useDispatch } from 'react-redux';
import CustomAvatar from '@src/components/CustomAvatar';

function PreviewMedia({ data }) {
	const { t } = useTranslation();

	const dispatch = useDispatch();

	const [isZoomEnabled, setZoomEnabled] = useState(false);

	useEffect(() => {
		PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');
	}, []);

	useEffect(() => {
		const handleKey = (event) => {
			// Escape
			if (event.keyCode === 27) {
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

	const handleClick = (event) => {
		if (event.target.className?.includes('app__mediaPreview__container')) {
			hideImageOrVideoPreview();
		}
	};

	const download = () => {
		if (!data.source) return;

		axios
			.get(data.source, {
				responseType: 'blob',
			})
			.then((res) => {
				const extension = mimeToExtension(res.headers['content-type']);
				const fileName = `getchat_${generateUniqueID()}.${extension}`;
				fileDownload(res.data, fileName);
			})
			.catch((error) => {
				console.log(error);
				if (error.response === undefined) {
					window.open(data.source, '_blank');
				}
			});
	};

	return (
		<div className="app__mediaPreview">
			<div className="app__mediaPreview__header">
				<Tooltip title={t('Close')}>
					<IconButton
						className="app__mediaPreview__close"
						onClick={hideImageOrVideoPreview}
						size="large"
					>
						<CloseIcon />
					</IconButton>
				</Tooltip>

				<CustomAvatar
					style={{
						backgroundColor: generateAvatarColor(data.senderName),
					}}
				>
					{data.initials}
				</CustomAvatar>

				<div className="app_imagePreview__header__senderInfo">
					<h3>{data.senderName}</h3>
					<span>
						<Moment calendar={CALENDAR_NORMAL} date={data.timestamp} unix />
					</span>
				</div>

				<Tooltip title={t('Download')}>
					<IconButton onClick={download} size="large">
						<GetApp />
					</IconButton>
				</Tooltip>
			</div>

			<ZoomTransition in={true}>
				<div className="app__mediaPreview__container" onClick={handleClick}>
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
			</ZoomTransition>

			{isZoomEnabled && data.type === ATTACHMENT_TYPE_IMAGE && (
				<PreviewMediaZoom
					src={data.source}
					onClick={() => setZoomEnabled(false)}
				/>
			)}
		</div>
	);
}

export default PreviewMedia;
