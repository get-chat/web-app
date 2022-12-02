import React, { useEffect, useState } from 'react';
import {
	Avatar,
	IconButton,
	Tooltip,
	Zoom as ZoomTransition,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Moment from 'react-moment';
import { CALENDAR_NORMAL } from '../../Constants';
import { generateAvatarColor } from '../../helpers/AvatarHelper';
import { GetApp } from '@mui/icons-material';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { generateUniqueID } from '../../helpers/Helpers';
import { useTranslation } from 'react-i18next';
import { mimeToExtension } from '../../helpers/ImageHelper';
import Image from '../Image';
import PreviewMediaZoom from './PreviewMediaZoom';

function PreviewMedia({ data, hideImageOrVideoPreview }) {
	const { t } = useTranslation();

	const [isZoomEnabled, setZoomEnabled] = useState(false);

	const chatMessageToPreview = data;

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

	const handleClick = (event) => {
		if (event.target.className?.includes('app__mediaPreview__container')) {
			hideImageOrVideoPreview();
		}
	};

	const download = () => {
		let fileURL =
			chatMessageToPreview.generateImageLink(true) ??
			chatMessageToPreview.generateVideoLink(true);

		if (!fileURL) return;

		axios
			.get(fileURL, {
				responseType: 'blob',
			})
			.then((res) => {
				const extension = mimeToExtension(res.headers['content-type']);
				const fileName = `getchat_${generateUniqueID()}.${extension}`;
				fileDownload(res.data, fileName);
			})
			.catch((error) => {
				console.log(error);
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

				<Avatar
					style={{
						backgroundColor: generateAvatarColor(
							chatMessageToPreview.senderName
						),
					}}
				>
					{chatMessageToPreview.initials}
				</Avatar>

				<div className="app_imagePreview__header__senderInfo">
					<h3>{chatMessageToPreview.senderName}</h3>
					<span>
						<Moment
							calendar={CALENDAR_NORMAL}
							date={chatMessageToPreview.timestamp}
							unix
						/>
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
					{(chatMessageToPreview.imageId ||
						chatMessageToPreview.imageLink ||
						chatMessageToPreview.getHeaderFileLink('image')) && (
						<Image
							className="app__mediaPreview__image"
							src={chatMessageToPreview.generateImageLink(true)}
							alt="Preview"
							onClick={() => setZoomEnabled(true)}
						/>
					)}
					{(chatMessageToPreview.videoId ||
						chatMessageToPreview.videoLink ||
						chatMessageToPreview.getHeaderFileLink('video')) && (
						<video
							className="app__mediaPreview__video"
							src={chatMessageToPreview.generateVideoLink(true)}
							controls
							autoPlay={true}
						/>
					)}
				</div>
			</ZoomTransition>

			{isZoomEnabled &&
				(chatMessageToPreview.imageId ||
					chatMessageToPreview.imageLink ||
					chatMessageToPreview.getHeaderFileLink('image')) && (
					<PreviewMediaZoom
						src={chatMessageToPreview.generateImageLink(true)}
						onClick={() => setZoomEnabled(false)}
					/>
				)}
		</div>
	);
}

export default PreviewMedia;
