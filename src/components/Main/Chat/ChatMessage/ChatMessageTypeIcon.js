import React from 'react';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import NoteIcon from '@material-ui/icons/Note';
import SmsIcon from '@material-ui/icons/Sms';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ContactsIcon from '@material-ui/icons/Contacts';

function ChatMessageTypeIcon(props) {
	return (
		<span>
			{props.type === ChatMessageModel.TYPE_IMAGE && <PhotoCameraIcon />}

			{props.type === ChatMessageModel.TYPE_VIDEO && <VideocamIcon />}

			{props.type === ChatMessageModel.TYPE_VOICE && <MicIcon />}

			{props.type === ChatMessageModel.TYPE_AUDIO && <AudiotrackIcon />}

			{props.type === ChatMessageModel.TYPE_DOCUMENT && <InsertDriveFileIcon />}

			{props.type === ChatMessageModel.TYPE_STICKER && <NoteIcon />}

			{props.type === ChatMessageModel.TYPE_LOCATION && <LocationOnIcon />}

			{props.type === ChatMessageModel.TYPE_TEMPLATE && <SmsIcon />}

			{props.type === ChatMessageModel.TYPE_INTERACTIVE && <TouchAppIcon />}

			{props.type === ChatMessageModel.TYPE_CONTACTS && <ContactsIcon />}
		</span>
	);
}

export default ChatMessageTypeIcon;
