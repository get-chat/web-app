import React, {useEffect, useRef, useState} from 'react';
import DoneAll from "@material-ui/icons/DoneAll";
import DoneIcon from '@material-ui/icons/Done';
import Moment from "react-moment";
import {Avatar, Button, IconButton} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import '../styles/InputRange.css';
import PauseIcon from '@material-ui/icons/Pause';
import HeadsetIcon from '@material-ui/icons/Headset';
import '../AvatarStyles';
import {avatarStyles} from "../AvatarStyles";
import PubSub from 'pubsub-js';
import {formatMessage, generateInitialsHelper, insertTemplateComponentParameters} from "../Helpers";
import {EVENT_TOPIC_CHAT_MESSAGE} from "../Constants";
import NoteIcon from '@material-ui/icons/Note';
import SmsIcon from '@material-ui/icons/Sms';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChatMessageClass from "../ChatMessageClass";
import MessageDateIndicator from "./MessageDateIndicator";
import ContextChatMessage from "./ContextChatMessage";
import ReplyIcon from '@material-ui/icons/Reply';
import ChatMessageVideo from "./ChatMessageVideo";
import ChatMessageImage from "./ChatMessageImage";
import ChatMessageDocument from "./ChatMessageDocument";

const playIconStyles = {
    fontSize: '38px'
};

const iconStyles = {
    fontSize: '15px'
};

function ChatMessage(props) {

    const data = props.messageData;
    const templateData = data.type === ChatMessageClass.TYPE_TEMPLATE ? props.templates[data.templateName] : undefined;

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

                {data.isForwarded &&
                <div className="chat__forwarded">
                    <ReplyIcon />
                    <span>Forwarded</span>
                </div>
                }

                {data.contextMessage !== undefined &&
                <ContextChatMessage
                    contextMessage={data.contextMessage}
                    goToMessageId={props.goToMessageId} />
                }

                {data.type === ChatMessageClass.TYPE_IMAGE &&
                <ChatMessageImage data={data} source={data.generateImageLink()} onPreview={() => props.onPreview(data)} />
                }

                {data.type === ChatMessageClass.TYPE_VIDEO &&
                <ChatMessageVideo data={data} source={data.generateVideoLink()} onPreview={() => props.onPreview(data)} />
                }

                {(data.type === ChatMessageClass.TYPE_VOICE || data.type === ChatMessageClass.TYPE_AUDIO) &&
                <span className="chat__voice">
                    <span ref={duration} className="chat__voice__duration">{currentDuration}</span>
                    <IconButton onClick={() => playVoice()}>
                        {isPlaying ? <PauseIcon style={playIconStyles}/> : <PlayArrowIcon style={playIconStyles}/>}
                    </IconButton>
                    <input ref={range} dir="ltr" type="range" className="chat__voice__range" min="0" max="100" value={progress} onChange={(e) => changeDuration(e.target.value)} />
                    <audio ref={audio} src={data.voiceId ? data.generateVoiceLink() : data.generateAudioLink()} preload="none" onLoadedMetadata={event => console.log(event.target.duration)} />

                    <Avatar className={(data.voiceId !== undefined ?? data.voiceLink !== undefined) ? avatarClasses[data.initials] : avatarClasses.orange + " audioMessageAvatar"}>
                        {data.voiceId !== undefined ? <span>{data.initials}</span> : <HeadsetIcon/>}
                    </Avatar>
                </span>
                }

                {data.type === ChatMessageClass.TYPE_DOCUMENT &&
                <ChatMessageDocument data={data} />
                }

                {data.type === ChatMessageClass.TYPE_STICKER &&
                <span>
                    <NoteIcon fontSize="small" />
                </span>
                }

                {data.type === ChatMessageClass.TYPE_TEMPLATE &&
                <div className="chat__template">
                    <span className="chat__templateHeader">
                        <SmsIcon />Template message:<br/>
                    </span>

                    <div className="chat__templateContent">
                        {templateData !== undefined
                            ?
                            <div>
                                {Object.values(templateData.components).map((component, index) =>
                                    <div key={index}>
                                        {component.type === "HEADER" &&
                                        <div className="chat__templateContent__header">
                                            {component.format === "IMAGE" &&
                                            <ChatMessageImage data={data} source={data.getHeaderFileLink('image')} onPreview={() => props.onPreview(data)} />
                                            }
                                            {component.format === "VIDEO" &&
                                            <ChatMessageVideo
                                                data={data}
                                                source={data.getHeaderFileLink('video')}
                                                onPreview={() => props.onPreview(data)} />
                                            }
                                            {component.format === "DOCUMENT" &&
                                            <ChatMessageDocument data={data} />
                                            }
                                            {component.format === "TEXT" &&
                                            <div className="bold wordBreak" dangerouslySetInnerHTML={{ __html: insertTemplateComponentParameters(component, data.templateParameters) }} />
                                            }
                                        </div>
                                        }

                                        {component.type === "BODY" &&
                                        <div className="wordBreak" dangerouslySetInnerHTML={{ __html: insertTemplateComponentParameters(component, data.templateParameters) }} />
                                        }

                                        {component.type === "BUTTONS" &&
                                        <div className="chat__templateContent__buttons">
                                            {component.buttons.map((button, buttonIndex) =>
                                                <Button key={buttonIndex} color="primary" fullWidth={true} disabled={true}>{button.text}</Button>
                                            )}
                                        </div>
                                        }
                                    </div>
                                )}
                            </div>
                            :
                            <div>Missing template</div>
                        }
                    </div>
                </div>
                }

                {(data.text ?? data.caption ?? data.buttonText) ? <span className="wordBreak" dangerouslySetInnerHTML={{__html: formatMessage((data.text ?? data.caption ?? data.buttonText))}} /> : '\u00A0'}

                <span className="chat__message__info">
                    <span className="chat__timestamp">
                        <Moment date={data.timestamp} format={dateFormat} unix />
                    </span>

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