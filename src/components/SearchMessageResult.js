import React from 'react';
import Moment from "react-moment";
import {markOccurrences} from "../Helpers";
import ChatMessageClass from "../ChatMessageClass";
import ImageIcon from '@material-ui/icons/Image';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import NoteIcon from "@material-ui/icons/Note";
import DoneAll from "@material-ui/icons/DoneAll";
import SmsIcon from "@material-ui/icons/Sms";

const dateFormat = 'H:mm';

function SearchMessageResult(props) {

    const data = props.messageData;

    return(
        <div className="searchResult__message" onClick={() => props.onClick(data)}>
            <div className="searchResult__message__header">
                <Moment unix format={dateFormat}>{data.timestamp}</Moment>
            </div>
            <div className="searchResult__message__body">

                <span className="searchResult__message__body__type">
                    {data.type === ChatMessageClass.TYPE_TEXT &&
                    <DoneAll />
                    }

                    {data.type === ChatMessageClass.TYPE_IMAGE &&
                    <ImageIcon />
                    }

                    {data.type === ChatMessageClass.TYPE_VIDEO &&
                    <VideocamIcon />
                    }

                    {data.type === ChatMessageClass.TYPE_VOICE &&
                    <MicIcon />
                    }

                    {data.type === ChatMessageClass.TYPE_AUDIO &&
                    <AudiotrackIcon />
                    }

                    {data.type === ChatMessageClass.TYPE_DOCUMENT &&
                    <InsertDriveFileIcon />
                    }

                    {data.type === ChatMessageClass.TYPE_STICKER &&
                    <NoteIcon />
                    }

                    {data.type === ChatMessageClass.TYPE_TEMPLATE &&
                    <SmsIcon />
                    }
                </span>

                <span className="searchResult__message__body__text" dangerouslySetInnerHTML={{__html: markOccurrences(data.text ?? data.caption, props.keyword)}} />
            </div>
        </div>
    )
}

export default SearchMessageResult;