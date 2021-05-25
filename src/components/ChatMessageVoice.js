import React, {useEffect, useRef, useState} from "react";
import {Avatar, IconButton} from "@material-ui/core";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import HeadsetIcon from "@material-ui/icons/Headset";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_CHAT_MESSAGE, EVENT_TOPIC_UNSUPPORTED_FILE} from "../Constants";
import {avatarStyles} from "../AvatarStyles";
import {isAudioMimeTypeSupported} from "../FileHelpers";
import UnsupportedFileClass from "../UnsupportedFileClass";

function ChatMessageVoice(props) {

    const data = props.data;

    const [isPlaying, setPlaying] = useState(false);
    const duration = useRef(null);
    const [progress, setProgress] = useState(0);
    const [currentDuration, setCurrentDuration] = useState("0:00");
    const audio = useRef(null);
    const range = useRef(null);

    const onChatMessageEvent = function (msg, data) {
        if (data === 'pause') {
            pauseVoice();
        }
    };

    const avatarClasses = avatarStyles();

    const playIconStyles = {
        fontSize: '38px'
    };

    useEffect(() => {
        // Subscribing only if there is voice or audio
        if (data.hasAnyAudio()) {
            const token = PubSub.subscribe(EVENT_TOPIC_CHAT_MESSAGE, onChatMessageEvent);
            return () => {
                PubSub.unsubscribe(token);
            }
        }
    }, []);

    const pauseVoice = () => {
        if (audio.current && range.current && !audio.current.paused) {
            audio.current.pause();
            setPlaying(false);
        }
    };

    const playVoice = () => {
        if (audio.current && range.current) {
            if (!audio.current.paused) {
                audio.current.pause();
                setPlaying(false);
            } else {

                // Pause others
                PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');

                console.log(data.mimeType);

                if (isAudioMimeTypeSupported(data.mimeType)) {
                    audio.current.play();
                    setPlaying(true);
                } else {
                    const unsupportedFile = new UnsupportedFileClass({
                        name: props.data.filename,
                        link: props.data.audioLink
                    });
                    PubSub.publish(EVENT_TOPIC_UNSUPPORTED_FILE, unsupportedFile);
                }
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
        return (s-(s%=60))/60+(9<s?':':':0')+s;
    }

    const changeDuration = (value) => {
        if (audio.current && range.current && audio.current.duration !== Infinity) {
            setProgress(value);
            const nextCurrentTime = audio.current.duration / value;
            if (nextCurrentTime !== Infinity && !isNaN(nextCurrentTime)) {
                audio.current.currentTime = parseFloat(nextCurrentTime);
            }
        }
    }

    return (
        <div className="chat__voice">
            <span ref={duration} className="chat__voice__duration">{currentDuration}</span>
            <IconButton onClick={() => playVoice()}>
                {isPlaying ? <PauseIcon style={playIconStyles}/> : <PlayArrowIcon style={playIconStyles}/>}
            </IconButton>
            <input ref={range} dir="ltr" type="range" className="chat__voice__range" min="0" max="100" value={progress} onChange={(e) => changeDuration(e.target.value)} />
            <audio ref={audio} src={data.voiceId ? data.generateVoiceLink() : data.generateAudioLink()} preload="none" onLoadedMetadata={event => console.log(event.target.duration)} />

            <Avatar className={(data.voiceId !== undefined ?? data.voiceLink !== undefined) ? avatarClasses[data.initials] : avatarClasses.orange + " audioMessageAvatar"}>
                {data.voiceId !== undefined ? <span>{data.initials}</span> : <HeadsetIcon/>}
            </Avatar>
        </div>
    )
}

export default ChatMessageVoice;