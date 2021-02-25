import React from "react";
import ChatMessageClass from "../ChatMessageClass";
import ImageIcon from "@material-ui/icons/Image";
import VideocamIcon from "@material-ui/icons/Videocam";
import MicIcon from "@material-ui/icons/Mic";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import NoteIcon from "@material-ui/icons/Note";
import SmsIcon from "@material-ui/icons/Sms";

function ChatMessageTypeIcon(props) {
    return (
        <span>
            {props.type === ChatMessageClass.TYPE_IMAGE &&
            <ImageIcon />
            }

            {props.type === ChatMessageClass.TYPE_VIDEO &&
            <VideocamIcon />
            }

            {props.type === ChatMessageClass.TYPE_VOICE &&
            <MicIcon />
            }

            {props.type === ChatMessageClass.TYPE_AUDIO &&
            <AudiotrackIcon />
            }

            {props.type === ChatMessageClass.TYPE_DOCUMENT &&
            <InsertDriveFileIcon />
            }

            {props.type === ChatMessageClass.TYPE_STICKER &&
            <NoteIcon />
            }

            {props.type === ChatMessageClass.TYPE_TEMPLATE &&
            <SmsIcon />
            }
        </span>
    )
}

export default ChatMessageTypeIcon;