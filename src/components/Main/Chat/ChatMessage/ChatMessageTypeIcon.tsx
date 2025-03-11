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

interface Props {
	type: string;
}

const ChatMessageTypeIcon: React.FC<Props> = ({ type }) => {
	return (
		<span>
			{type === ChatMessageModel.TYPE_IMAGE && <PhotoCameraIcon />}
			{type === ChatMessageModel.TYPE_VIDEO && <VideocamIcon />}
			{type === ChatMessageModel.TYPE_VOICE && <MicIcon />}
			{type === ChatMessageModel.TYPE_AUDIO && <AudiotrackIcon />}
			{type === ChatMessageModel.TYPE_DOCUMENT && <InsertDriveFileIcon />}
			{type === ChatMessageModel.TYPE_STICKER && <NoteIcon />}
			{type === ChatMessageModel.TYPE_LOCATION && <LocationOnIcon />}
			{type === ChatMessageModel.TYPE_TEMPLATE && <SmsIcon />}
			{type === ChatMessageModel.TYPE_INTERACTIVE && <TouchAppIcon />}
			{type === ChatMessageModel.TYPE_CONTACTS && <ContactsIcon />}
		</span>
	);
};

export default ChatMessageTypeIcon;
