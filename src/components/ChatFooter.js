import React, {useEffect, useRef, useState} from 'react';
import {IconButton, Tooltip} from "@material-ui/core";
import {AttachFile, InsertEmoticon, Send} from "@material-ui/icons";
import SmsIcon from '@material-ui/icons/Sms';
import ImageIcon from '@material-ui/icons/Image';
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import MicIcon from '@material-ui/icons/Mic';
import {Emoji, NimblePicker} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import '../styles/EmojiPicker.css';
import data from 'emoji-mart/data/facebook.json';
import CloseIcon from "@material-ui/icons/Close";
import {EMOJI_SET, EMOJI_SHEET_SIZE, EMPTY_IMAGE_BASE64, EVENT_TOPIC_EMOJI_PICKER_VISIBILITY} from "../Constants";
import PubSub from "pubsub-js";
import FileInput from "./FileInput";
import {getSelectionHtml, replaceEmojis, translateHTMLInputToText} from "../Helpers";
import VoiceRecorder from "../VoiceRecorder";
import DoneIcon from "@material-ui/icons/Done";
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

function ChatFooter(props) {

    const fileInput = useRef(null);
    const editable = useRef(null);

    const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);

    const voiceRecorder = useRef(new VoiceRecorder());
    const [isRecording, setRecording] = useState(false);

    const handleAttachmentClick = (acceptValue) => {
        props.setAccept(acceptValue);

        fileInput.current.setAttribute('accept', acceptValue);
        fileInput.current.click();
    }

    const handleEmojiPickerVisibility = function (msg, data) {
        setEmojiPickerVisible(data);
    }

    let timeout;
    const handleEditableChange = (event) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function () {
            props.setInput(event.target.innerHTML)
        }, 5);
    }

    useEffect(() => {
        const token = PubSub.subscribe(EVENT_TOPIC_EMOJI_PICKER_VISIBILITY, handleEmojiPickerVisibility);

        return () => {
            PubSub.unsubscribe(token);
        }
    }, []);

    useEffect(() => {
        // Clear editable div when message is sent
        if (props.input === '') {
            editable.current.innerHTML = '';
        }
    }, [editable, props.input]);

    const toggleTemplateMessages = () => {
        // If messages container is already scrolled to bottom
        /*const elem = messagesContainer.current;
        const offset = 5;

        let willScroll = false;
        if (elem.offsetHeight + elem.scrollTop >= (elem.scrollHeight - offset)) {
            willScroll = true;
        }*/

        props.setTemplateMessagesVisible((prevState => !prevState));
    }

    function insertAtCursor(el, html) {
        if (!html) return;

        //html = html.replace('<span', '<span contentEditable="false"');
        html = html.replace('<span', '<img src="' + EMPTY_IMAGE_BASE64 + '"').replace('</span>', '');
        el.focus();

        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        range.deleteContents();
        let node = range.createContextualFragment(html);
        range.insertNode(node);

        // Persist cursor position
        selection.collapseToEnd();

        //el.dispatchEvent(new Event('input'));
        props.setInput(el.innerHTML);
    }

    const handleEmojiSelect = (emoji) => {
        if (editable.current) {
            // TODO: Try to avoid creating an emoji object here, if possible
            const emojiOutput = Emoji({
                html: true,
                emoji: emoji.colons,
                size: 22,
                set: EMOJI_SET,
                sheetSize: EMOJI_SHEET_SIZE
            });

            insertAtCursor(editable.current, emojiOutput);
        }
    }

    const handlePaste = (event) => {
        let text = (event.originalEvent || event).clipboardData.getData('text/plain');
        text = replaceEmojis(text, true);

        insertAtCursor(editable.current, text);

        event.preventDefault();
    }

    const handleCopy = (event) => {
        let data = getSelectionHtml();
        data = translateHTMLInputToText(data);
        event.clipboardData.setData('text', data);

        event.preventDefault();
    }

    const requestMicrophonePermission = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(function (stream) {
                    startVoiceRecord(stream);
                })
                .catch(function (err) {
                    console.log('Permission denied');
                    // TODO: Display information
                });
        } else {
            console.log('Not supported on your browser.');
        }
    }

    const startVoiceRecord = (stream) => {
        // If it is already recording, return
        if (voiceRecorder.current?.isRecording()) return;

        // Start recording
        voiceRecorder.current?.start(
            stream,
            function () {
                setRecording(true);
            },
            function (audioURL) {
                setRecording(false);

                console.log(audioURL);
            }
        );
    }

    const stopVoiceRecord = () => {
        voiceRecorder.current?.stop();
    }

    const sendVoiceRecord = () => {
        stopVoiceRecord();

        setTimeout(function () {
            const audioURL = voiceRecorder.current.lastAudioURL;
            console.log('Send: ' + audioURL);
        }, 1000);
    }

    const hasInput = () => {
        return props.input && props.input.length > 0;
    }

    return (
        <div className="chat__footerOuter" onDrop={(event) => event.preventDefault()}>

            {isEmojiPickerVisible &&
            <div className="chat__footer__emojiPicker">
                <NimblePicker
                    set={EMOJI_SET}
                    sheetSize={EMOJI_SHEET_SIZE}
                    data={data}
                    showPreview={false}
                    emojiSize={32}
                    onSelect={handleEmojiSelect}/>
            </div>
            }

            <div className="chat__footer">

                {isEmojiPickerVisible &&
                <Tooltip title="Close" placement="top">
                    <IconButton onClick={() => setEmojiPickerVisible(false)}>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
                }

                <Tooltip title="Emoji" placement="top">
                    <IconButton onClick={() => setEmojiPickerVisible(prevState => !prevState)}>
                        <InsertEmoticon/>
                    </IconButton>
                </Tooltip>

                <span className="chat__footer__attachmentContainer">
                <Tooltip title="Attachment" placement="right">
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                </Tooltip>

                <div className="chat__footer__attachmentContainer__options">

                    <Tooltip title="Documents" placement="right">
                        <IconButton
                            className="chat__footer__attachmentContainer__options__document"
                            onClick={() => handleAttachmentClick('*.*')}>
                            <InsertDriveFileIcon/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Images & Videos" placement="right">
                        <IconButton
                            className="chat__footer__attachmentContainer__options__imageAndVideo"
                            onClick={() => handleAttachmentClick('image/jpeg, image/png, image/webp, video/mp4, video/3gpp')}>
                            <ImageIcon/>
                        </IconButton>
                    </Tooltip>

                </div>
            </span>

                <Tooltip title="Templates" placement="top">
                    <IconButton onClick={toggleTemplateMessages}>
                        <SmsIcon />
                    </IconButton>
                </Tooltip>

                <div className="hidden">
                    <FileInput
                        innerRef={fileInput}
                        handleSelectedFiles={ (files) => props.setSelectedFiles({...files}) } />
                </div>

                <form>
                    <div className="typeBox">

                        {!props.input &&
                        <div className="typeBox__hint">Type a message</div>
                        }
                        <div
                            id="typeBox__editable"
                            ref={editable}
                            className="typeBox__editable"
                            contentEditable="true"
                            onPaste={(event) => handlePaste(event)}
                            onCopy={(event) => handleCopy(event)}
                            onDrop={(event) => event.preventDefault()}
                            spellCheck="true"
                            onInput={event => handleEditableChange(event)}
                            onKeyDown={(e) => {if (e.keyCode === 13 && !e.shiftKey) props.sendMessage(e)}}
                        />

                    </div>
                    <button onClick={props.sendMessage} type="submit">Send a message</button>
                </form>

                {hasInput() &&
                    <Tooltip title="Send" placement="top">
                        <IconButton onClick={props.sendMessage}>
                            <Send/>
                        </IconButton>
                    </Tooltip>
                }

                {(!hasInput() && !isRecording) &&
                    <Tooltip title="Voice" placement="top">
                    <IconButton onClick={requestMicrophonePermission}>
                    <MicIcon/>
                    </IconButton>
                    </Tooltip>
                }

                {isRecording &&
                <div className="voiceRecord">
                    <IconButton onClick={stopVoiceRecord} className="voiceRecord__cancelButton">
                        <CloseIcon />
                    </IconButton>

                    <FiberManualRecordIcon className="voiceRecord__recordIcon" />
                    <span className="voiceRecord__timer">0:00</span>

                    <IconButton onClick={sendVoiceRecord} className="voiceRecord__sendButton">
                        <DoneIcon />
                    </IconButton>
                </div>
                }
            </div>
        </div>
    )
}

export default ChatFooter;