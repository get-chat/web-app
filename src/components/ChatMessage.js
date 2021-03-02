import React, {useEffect, useRef, useState} from 'react';
import DoneAll from "@material-ui/icons/DoneAll";
import DoneIcon from '@material-ui/icons/Done';
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
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import NoteIcon from '@material-ui/icons/Note';
import SmsIcon from '@material-ui/icons/Sms';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChatMessageClass from "../ChatMessageClass";
import MessageDateIndicator from "./MessageDateIndicator";

const playIconStyles = {
    fontSize: '38px'
};

const iconStyles = {
    fontSize: '15px'
};

function ChatMessage(props) {

    const data = props.messageData;

    const generateInitials = () => {
        return (data.senderName ? data.senderName[0] : '')?.toUpperCase();
    }

    data.preparedInitials = generateInitials();
    data.preparedAvatarClassName = data.preparedInitials ? data.preparedInitials[0] : '';

    const [isPlaying, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentDuration, setCurrentDuration] = useState("0:00");
    const audio = useRef(null);
    const range = useRef(null);
    const duration = useRef(null);

    const onChatMessageEvent = function (msg, data) {
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
            const token = PubSub.subscribe(EVENT_TOPIC_CHAT_MESSAGE, onChatMessageEvent);
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

    const avatarClasses = avatarStyles();

    const dateFormat = 'H:mm';

    return (
        <div id={'message_' + data.id} className={"chat__message__outer" + (data.isFromUs === true ? " outgoing" : "")}>

            {props.displayDate &&
            <MessageDateIndicator
                timestamp={data.timestamp} />
            }

            {(props.displaySender || props.displayDate) &&
            <span className="chat__name">{data.senderName}</span>
            }

            {data.type === ChatMessageClass.TYPE_STICKER &&
            <img className="chat__media chat__sticker" src={data.generateStickerLink()} alt={data.caption} />
            }

            <div className={"chat__message"
                + (data.hasMediaToPreview() ? " hasMedia" : "")
                + (data.isFromUs === true ? (data.isRead() ? " chat__seen" : "") + " chat__receiver" : "")
                + (!props.displaySender && !props.displayDate ? " hiddenSender" : "")
                + (data.type === ChatMessageClass.TYPE_TEMPLATE ? " chat__templateMsg" : "")}>

                <div className="chat__message__more" onClick={(event => props.onOptionsClick(event, data))}>
                    <ExpandMoreIcon />
                </div>

                {data.contextId !== undefined &&
                <div className="chat__message__context" onClick={() => props.goToMessageId(data.contextId, data.contextTimestamp)}>
                    {data.contextId}
                </div>
                }

                {data.imageLink !== undefined &&
                <img className="chat__media" src={data.imageLink} alt={data.caption} onClick={() => props.onPreview(data)} />
                }
                {data.videoLink !== undefined &&
                <div className="chat__videoWrapper" onClick={() => props.onPreview(data)}>
                    <video className="chat__media" src={data.generateVideoLink()} preload="none" />
                    <span className="chat__videoWrapper__iconWrapper">
                    <PlayArrowIcon fontSize={"large"} style={{ fill: "white", fontSize: 40 }} />
                </span>
                </div>
                }
                {(data.type === ChatMessageClass.TYPE_VOICE || data.type === ChatMessageClass.TYPE_AUDIO) &&
                <span className="chat__voice">
                    <span ref={duration} className="chat__voice__duration">{currentDuration}</span>
                    <IconButton onClick={() => playVoice()}>
                        {isPlaying ? <PauseIcon style={playIconStyles}/> : <PlayArrowIcon style={playIconStyles}/>}
                    </IconButton>
                    <input ref={range} dir="ltr" type="range" className="chat__voice__range" min="0" max="100" value={progress} onChange={(e) => changeDuration(e.target.value)} />
                    <audio ref={audio} src={data.voiceId ? data.generateVoiceLink() : data.generateAudioLink()} preload="none" onLoadedMetadata={event => console.log(event.target.duration)} />

                    <Avatar className={(data.voiceId !== undefined ?? data.voiceLink !== undefined) ? avatarClasses[data.preparedInitials] : avatarClasses.orange + " audioMessageAvatar"}>
                        {data.voiceId !== undefined ? <span>{data.preparedInitials}</span> : <HeadsetIcon/>}
                    </Avatar>
                </span>
                }
                {data.type === ChatMessageClass.TYPE_DOCUMENT &&
                <a href={data.documentLink} target="_blank" className="chat__document">
                    <InsertDriveFileIcon fontSize="small" />
                    <span className="chat__document__filename">{data.documentCaption ?? (data.documentFileName ?? 'Document')}</span>
                </a>
                }

                {data.type === ChatMessageClass.TYPE_STICKER &&
                <span>
                    <NoteIcon fontSize="small" />
                </span>
                }

                {data.type === ChatMessageClass.TYPE_TEMPLATE &&
                <span className="chat__templateHeader">
                    <SmsIcon />Template message:<br/>
                </span>
                }

                {data.type === ChatMessageClass.TYPE_TEMPLATE &&
                <span className="wordBreak" dangerouslySetInnerHTML={{__html: formatMessage(props.templates[data.templateName]?.text) }} />
                }

                {(data.text ?? data.caption) ? <span className="wordBreak" dangerouslySetInnerHTML={{__html: formatMessage((data.text ?? data.caption))}} /> : '\u00A0'}

                <span className="chat__message__info">
                    <span className="chat__timestamp"><Moment date={data.timestamp} format={dateFormat} unix /></span>

                    {(data.isFromUs === true && !data.isDeliveredOrRead()) &&
                    <DoneIcon className="chat__iconDone" color="inherit" style={iconStyles} />
                    }

                    {(data.isFromUs === true && data.isDeliveredOrRead()) &&
                    <DoneAll className="chat__iconDoneAll" color="inherit" style={iconStyles} />
                    }
                </span>

                <div style={{clear: "both"}} />
            </div>
        </div>
    )
}

export default ChatMessage