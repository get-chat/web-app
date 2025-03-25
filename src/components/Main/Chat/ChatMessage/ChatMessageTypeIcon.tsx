import React from 'react';
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
import { MessageType } from '@src/types/messages';

interface Props {
	type: MessageType;
}

const ChatMessageTypeIcon: React.FC<Props> = ({ type }) => {
	return (
		<span>
			{type === MessageType.image && <PhotoCameraIcon />}
			{type === MessageType.video && <VideocamIcon />}
			{type === MessageType.voice && <MicIcon />}
			{type === MessageType.audio && <AudiotrackIcon />}
			{type === MessageType.document && <InsertDriveFileIcon />}
			{type === MessageType.sticker && <NoteIcon />}
			{type === MessageType.location && <LocationOnIcon />}
			{type === MessageType.template && <SmsIcon />}
			{type === MessageType.interactive && <TouchAppIcon />}
			{type === MessageType.contacts && <ContactsIcon />}
		</span>
	);
};

export default ChatMessageTypeIcon;
