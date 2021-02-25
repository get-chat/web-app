import React from 'react';
import Moment from "react-moment";
import {markOccurrences, replaceEmojis} from "../Helpers";
import ChatMessageClass from "../ChatMessageClass";
import ImageIcon from '@material-ui/icons/Image';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicIcon from '@material-ui/icons/Mic';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import NoteIcon from "@material-ui/icons/Note";
import DoneAll from "@material-ui/icons/DoneAll";
import SmsIcon from "@material-ui/icons/Sms";
import DoneIcon from "@material-ui/icons/Done";
import {CALENDAR_NORMAL} from "../Constants";

function SearchMessageResult(props) {

    const data = props.messageData;

    return(
        <div className="searchResult__message" onClick={() => props.onClick(data)}>
            <div className="searchResult__message__header">
                <Moment unix calendar={CALENDAR_NORMAL} date={data.timestamp} />
            </div>
            <div className="searchResult__message__body">

                <span className="searchResult__message__body__type">
                    {data.isFromUs === true && data.type === ChatMessageClass.TYPE_TEXT &&
                    <span className={data.isRead() ? 'chat__seen' : ''}>
                        {data.isDeliveredOrRead()
                            ?
                            <DoneAll className="chat__iconDoneAll" />
                            :
                            <DoneIcon />
                        }
                    </span>
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

                <span className="searchResult__message__body__text" dangerouslySetInnerHTML={{__html: replaceEmojis(markOccurrences(data.text ?? data.caption, props.keyword), true)}} />
            </div>
        </div>
    )
}

export default SearchMessageResult;