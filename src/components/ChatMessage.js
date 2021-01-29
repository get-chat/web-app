import React, {useEffect, useRef, useState} from 'react';
import DoneAll from "@material-ui/icons/DoneAll";
import Moment from "react-moment";
import {Avatar, IconButton} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import '../styles/InputRange.css';
import PauseIcon from '@material-ui/icons/Pause';
import HeadsetIcon from '@material-ui/icons/Headset';
import '../AvatarStyles';
import {avatarStyles} from "../AvatarStyles";
import PubSub from 'pubsub-js';
import {formatMessage} from "../Helpers";
import {EVENT_TOPIC_CHAT_MESSAGE} from "../Constants";

const playIconStyles = {
    fontSize: '38px'
};

const iconStyles = {
    fontSize: '15px'
};

function ChatMessage(props) {

    const data = props.messageData;

    const [isPlaying, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentDuration, setCurrentDuration] = useState("0:00");
    const audio = useRef(null);
    const range = useRef(null);
    const duration = useRef(null);

    const mySubscriber = function (msg, data) {
        //console.log(msg, data);
        if (data === 'pause') {
            pauseVoice();
        }
    };

    const pauseVoice = () => {
        if (audio.current && range.current && !audio.current.paused) {
            audio.current.pause();
            setPlaying(false);
        }
    };

    useEffect(() => {
        // Subscribing only if there is voice or audio
        if (data.hasAnyAudio()) {
            const token = PubSub.subscribe(EVENT_TOPIC_CHAT_MESSAGE, mySubscriber);
            return () => {
                PubSub.unsubscribe(token);
            }
        }
    }, []);

    const playVoice = () => {
        if (audio.current && range.current) {
            if (!audio.current.paused) {
                audio.current.pause();
                setPlaying(false);
            } else {

                // Pause others
                PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');

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

    const avatarClasses = avatarStyles();

    const dateFormat = 'H:mm';

    return(
        <div className={"chat__message" + (data.hasMediaToPreview() ? " hasMedia" : "") + (data.isFromUs === true ? (data.isSeen === true ? " chat__seen" : "") + " chat__receiver" : "")}>
            <span className="chat__name">{props.name}</span>
            {data.imageLink !== undefined &&
            <img className="chat__media" src={data.imageLink} alt={data.caption} onClick={() => props.onPreview(data)} />
            }
            {data.videoId !== undefined &&
            <div className="chat__videoWrapper" onClick={() => props.onPreview(data)}>
                <video className="chat__media" src={data.generateVideoLink()} preload="metadata" />
                <span className="chat__videoWrapper__iconWrapper">
                    <PlayArrowIcon fontSize={"large"} style={{ fill: "white", fontSize: 40 }} />
                </span>
            </div>
            }
            {data.hasAnyAudio() &&
            <span className="chat__voice">
                <span ref={duration} className="chat__voice__duration">{currentDuration}</span>
                <IconButton onClick={() => playVoice()}>
                    {isPlaying ? <PauseIcon style={playIconStyles}/> : <PlayArrowIcon style={playIconStyles}/>}
                </IconButton>
                <input ref={range} dir="ltr" type="range" className="chat__voice__range" min="0" max="100" value={progress} onChange={(e) => changeDuration(e.target.value)} />
                <audio ref={audio} src={data.voiceId ? data.generateVoiceLink() : data.generateAudioLink()} preload="none" onLoadedMetadata={event => console.log(event.target.duration)} />

                <Avatar className={data.voiceId !== undefined ? avatarClasses.green : avatarClasses.orange}>
                    {data.voiceId !== undefined ? <span>{props.name ? props.name[0] : ""}</span> : <HeadsetIcon/>}
                </Avatar>
            </span>
            }
            {(data.text ?? data.caption) ? <span dangerouslySetInnerHTML={{__html: formatMessage((data.text ?? data.caption))}} /> : '\u00A0'}
            <span className="chat__message__info">
                <span className="chat__timestamp"><Moment date={data.timestamp} format={dateFormat} unix /></span>
                {data.isFromUs === true &&
                <DoneAll className="chat__iconDoneAll" color="inherit" style={iconStyles} />
                }
            </span>
        </div>
    )
}

export default ChatMessage