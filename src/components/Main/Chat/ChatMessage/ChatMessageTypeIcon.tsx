import React from 'react';
import VideocamIcon from '@src/components/icons/Videocam';
import MicIcon from '@src/components/icons/Mic';
import AudiotrackIcon from '@src/components/icons/MusicNote';
import InsertDriveFileIcon from '@src/components/icons/Draft';
import NoteIcon from '@src/components/icons/StickyNote2';
import SmsIcon from '@src/components/icons/Sms';
import TouchAppIcon from '@src/components/icons/TouchApp';
import PhotoCameraIcon from '@src/components/icons/PhotoCamera';
import LocationOnIcon from '@src/components/icons/LocationOn';
import ContactsIcon from '@src/components/icons/Contacts';
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
