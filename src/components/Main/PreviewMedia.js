import React, { useEffect, useRef } from 'react';
import {
	Avatar,
	IconButton,
	Tooltip,
	Zoom as ZoomTransition,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Moment from 'react-moment';
import { CALENDAR_NORMAL } from '../../Constants';
import { generateAvatarColor } from '../../helpers/AvatarHelper';
import { GetApp } from '@material-ui/icons';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { generateUniqueID } from '../../helpers/Helpers';
import { useTranslation } from 'react-i18next';
import { mimeToExtension } from '../../helpers/ImageHelper';
import Image from '../Image';

function PreviewMedia({ data, hideImageOrVideoPreview }) {
	const { t } = useTranslation();

	const zoomView = useRef();

	const chatMessageToPreview = data;

	useEffect(() => {
		const handleKey = (event) => {
			if (event.keyCode === 27) {
				// Escape
				hideImageOrVideoPreview();
			}
		};

		document.addEventListener('keydown', handleKey);

		const handleMouseMove = (event) => {
			zoomView.current.style.transform =
				'translateX(' +
				event.x * -1 +
				'px) translateY(' +
				event.y * -1 +
				'px) scale(2)';
		};

		zoomView.current.addEventListener('mousemove', handleMouseMove);

		return () => {
			document.removeEventListener('keydown', handleKey);
			zoomView.current.removeEventListener('mousemove', handleMouseMove);
		};
	}, []);

	useEffect(() => {}, [zoomView.current]);

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
			});
	};

	return (
		<div className="app__mediaPreview">
			<div className="app__mediaPreview__header">
				<Tooltip title={t('Close')}>
					<IconButton
						className="app__mediaPreview__close"
						onClick={hideImageOrVideoPreview}
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
					<IconButton onClick={download}>
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

			{(chatMessageToPreview.imageId ||
				chatMessageToPreview.imageLink ||
				chatMessageToPreview.getHeaderFileLink('image')) && (
				<div className="app__mediaPreview__zoom" ref={zoomView}>
					<Image
						src={chatMessageToPreview.generateImageLink(true)}
						alt="Preview"
					/>
				</div>
			)}
		</div>
	);
}

export default PreviewMedia;
