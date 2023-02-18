// @ts-nocheck
import React from 'react';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NoteIcon from '@mui/icons-material/Note';
import SmsIcon from '@mui/icons-material/Sms';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactsIcon from '@mui/icons-material/Contacts';

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
