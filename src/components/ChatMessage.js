import React, {useRef, useState} from 'react';
import DoneAll from "@material-ui/icons/DoneAll";
import Moment from "react-moment";
import {Avatar, IconButton} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import {BASE_URL} from "../Constants";
import '../styles/InputRange.css';
import PauseIcon from '@material-ui/icons/Pause';
import HeadsetIcon from '@material-ui/icons/Headset';
import { makeStyles } from '@material-ui/core/styles';
import {green, orange} from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
    green: {
        color: '#fff',
        backgroundColor: green[500],
    },
    orange: {
        color: '#fff',
        backgroundColor: orange[500],
    }
}));

const playIconStyles = {
    fontSize: '38px'
};

const iconStyles = {
    fontSize: '15px'
};

function ChatMessage(props) {

    const [isPlaying, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentDuration, setCurrentDuration] = useState("0:00");
    const audio = useRef(null);
    const range = useRef(null);
    const duration = useRef(null);

    const playVoice = () => {
        if (audio.current && range.current) {
            if (!audio.current.paused) {
                audio.current.pause();
                setPlaying(false);
            } else {
                audio.current.play();
                setPlaying(true);
            }

            const interval = setInterval(function () {
                if (audio.current && range.current) {
                    const duration = audio.current.duration;
                    const currentTime = audio.current.currentTime;

                    setCurrentDuration(formatDuration(currentTime));

                    if (duration) {
                        const percentage = (currentTime * 100) / duration

                        if (percentage >= 100) {
                            setProgress(0);
                            setCurrentDuration(formatDuration(0));
                            setPlaying(false);
                            clearInterval(interval);
                        } else {
                            setProgress(percentage);
                        }
                    }

                    if (audio.current.paused) {
                        clearInterval(interval);
                    }
                } else {
                    // In case component is reloaded
                    clearInterval(interval);
                }
            }, 300);
        }
    }

    const formatDuration = (s) => {
        s = Math.floor(s);
        return(s-(s%=60))/60+(9<s?':':':0')+s;
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

    const classes = useStyles();

    const dateFormat = 'H:mm';

    return(
        <div className={"chat__message" + (props.isFromUs === true ? (props.isFromUs === true ? " chat__seen" : "") + " chat__receiver" : "")}>
            <span className="chat__name">{props.name}</span>
            {props.mediaURL !== undefined &&
            <img className="chat__media" src={props.mediaURL} alt={props.message} onClick={() => props.onPreview(props.mediaURL)} />
            }
            {(props.voice !== undefined || props.audio !== undefined) &&
            <span className="chat__voice">
                <span ref={duration} className="chat__voice__duration">{currentDuration}</span>
                <IconButton onClick={() => playVoice()}>
                    {isPlaying
                        ?
                        <PauseIcon style={playIconStyles}/>
                        :
                        <PlayArrowIcon style={playIconStyles}/>
                    }
                </IconButton>
                <input ref={range} dir="ltr" type="range" className="chat__voice__range" min="0" max="100" value={progress} onChange={(e) => changeDuration(e.target.value)} />
                <audio ref={audio} src={`${BASE_URL}media/${props.voice ?? props.audio}`} preload="metadata" onLoadedMetadata={event => console.log(event.target.duration)} />

                <Avatar className={props.voice !== undefined ? classes.green : classes.orange}>
                    {props.voice !== undefined ? <span>{props.name ? props.name[0] : ""}</span> : <HeadsetIcon/>}
                </Avatar>
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