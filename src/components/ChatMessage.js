import React, {useRef, useState} from 'react';
import DoneAll from "@material-ui/icons/DoneAll";
import Moment from "react-moment";
import {IconButton} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import {BASE_URL} from "../Constants";
import '../styles/InputRange.css';

function ChatMessage(props) {

    const [progress, setProgress] = useState(0);
    const audio = useRef(null);
    const range = useRef(null);

    const playVoice = () => {
        if (audio.current && range.current) {
            if (!audio.current.paused) {
                audio.current.pause();
            } else {
                audio.current.play();
            }

            const interval = setInterval(function () {
                const duration = audio.current.duration;
                const currentTime = audio.current.currentTime;
                if (duration) {
                    const percentage = (currentTime * 100) / duration

                    if (percentage === 100) {
                        setProgress(0);
                        clearInterval(interval);
                    } else {
                        setProgress(percentage);
                    }
                }

                if (audio.current.paused) {
                    clearInterval(interval);
                }
            }, 300);
        }
    }

    const changeDuration = (value) => {
        if (audio.current && range.current && audio.current.duration !== Infinity) {
            setProgress(value);
            const nextCurrentTime = audio.current.duration / value;
            if (nextCurrentTime !== Infinity) {
                audio.current.currentTime = nextCurrentTime;
            }
        }
    }

    let playIconStyles = {
        fontSize: '38px'
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
                    <IconButton onClick={() => playVoice()}>
                        <PlayArrowIcon style={playIconStyles} />
                    </IconButton>

                    <input ref={range} dir="ltr" type="range" className="chat__voice__range" min="0" max="100" value={progress} onChange={(e) => changeDuration(e.target.value)} />
                    <audio ref={audio} src={`${BASE_URL}media/${props.voice}`} preload="metadata" />
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