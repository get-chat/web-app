import React from 'react';
import { Avatar, IconButton, Zoom } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Moment from 'react-moment';
import { CALENDAR_NORMAL } from '../../Constants';
import { generateAvatarColor } from '../../helpers/AvatarHelper';
import { GetApp } from '@material-ui/icons';

function PreviewMedia(props) {
	const chatMessageToPreview = props.data;

	const download = () => {
		let link;

		if (
			chatMessageToPreview.imageId ||
			chatMessageToPreview.imageLink ||
			chatMessageToPreview.getHeaderFileLink('image')
		) {
			link = chatMessageToPreview.generateImageLink(true);
		} else if (
			chatMessageToPreview.videoId ||
			chatMessageToPreview.videoLink ||
			chatMessageToPreview.getHeaderFileLink('video')
		) {
			link = chatMessageToPreview.generateVideoLink(true);
		}

		console.log(link);
	};

	return (
		<div className="app__mediaPreview">
			<div className="app__mediaPreview__header">
				<IconButton
					className="app__mediaPreview__close"
					onClick={props.hideImageOrVideoPreview}
				>
					<CloseIcon />
				</IconButton>

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

				<IconButton onClick={download}>
					<GetApp />
				</IconButton>
			</div>

			<Zoom in={true}>
				<div
					className="app__mediaPreview__container"
					onClick={props.hideImageOrVideoPreview}
				>
					{(chatMessageToPreview.imageId ||
						chatMessageToPreview.imageLink ||
						chatMessageToPreview.getHeaderFileLink('image')) && (
						<img
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
			</Zoom>
		</div>
	);
}

export default PreviewMedia;
