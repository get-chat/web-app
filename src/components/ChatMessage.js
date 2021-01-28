import React, {useState} from 'react';
import DoneAll from "@material-ui/icons/DoneAll";
import Moment from "react-moment";
import {IconButton, LinearProgress} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

function ChatMessage(props) {

    const [progress, setProgress] = useState(0);

    let playIconStyles = {
        fontSize: '32px'
    };

    let iconStyles = {
        fontSize: '15px'
    };

    const dateFormat = 'H:mm';

    return(
        <div className={"chat__message" + (props.isFromUs === true ? (props.isFromUs === true ? " chat__seen" : "") + " chat__receiver" : "")}>
            <span className="chat__name">{props.name}</span>
            {props.mediaURL !== undefined &&
            <img className="chat__media" src={props.mediaURL} alt={props.message} onClick={() => props.onPreview(props.mediaURL)} />
            }
            {props.voice !== undefined &&
                <span className="chat__voice">
                    <IconButton onClick={() => props.onPlayVoice(props.voice)}>
                        <PlayArrowIcon style={playIconStyles} />
                    </IconButton>

                    <LinearProgress variant="determinate" value={progress} />
                </span>
            }
            {props.message ?? '\u00A0'}
            <span className="chat__message__info">
            <span className="chat__timestamp"><Moment date={props.timestamp} format={dateFormat} unix /></span>
                {props.isFromUs === true &&
                <DoneAll className="chat__iconDoneAll" color="inherit" style={iconStyles} />
                }
            </span>
        </div>
    )
}

export default ChatMessage