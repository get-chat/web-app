import React, {useEffect, useRef, useState} from 'react';
import {IconButton, Tooltip} from "@material-ui/core";
import {AttachFile, InsertEmoticon, Send} from "@material-ui/icons";
import SmsIcon from '@material-ui/icons/Sms';
import ImageIcon from '@material-ui/icons/Image';
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import {Emoji, NimblePicker} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import '../styles/EmojiPicker.css';
import data from 'emoji-mart/data/facebook.json';
import CloseIcon from "@material-ui/icons/Close";
import {EMOJI_SET} from "../Constants";

function ChatFooter(props) {

    const fileInput = useRef(null);
    const editable = useRef(null);

    const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);

    const handleAttachmentClick = (acceptValue) => {
        fileInput.current.setAttribute('accept', acceptValue);
        fileInput.current.click();
    }

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
        html = html.replace('<span', '<span contentEditable="false"');

        el.focus();
        document.execCommand('insertHTML', false, html);
        return false;
    }

    const handleEmojiSelect = (emoji) => {
        if (editable.current) {
            // TODO: Try to avoid creating an emoji object here, if possible
            const emojiOutput = Emoji({
                html: true,
                emoji: emoji.colons,
                size: 22,
                set: EMOJI_SET
            });

            insertAtCursor(editable.current, emojiOutput);
        }
    }

    return (
        <div className="chat__footerOuter">

            {isEmojiPickerVisible &&
            <div className="chat__footer__emojiPicker">
                <NimblePicker
                    set={EMOJI_SET}
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
                            onClick={() => handleAttachmentClick('application/*')}>
                            <InsertDriveFileIcon/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Images & Videos" placement="right">
                        <IconButton
                            className="chat__footer__attachmentContainer__options__imageAndVideo"
                            onClick={() => handleAttachmentClick('image/*, video/*')}>
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

                {/*<AttachmentTypesMenu />*/}

                <form className="chat__mediaForm">
                    <input
                        type="file"
                        //value={selectedFile}
                        onChange={(e) => props.setSelectedFile(e.target.files[0])}
                        ref={fileInput} />
                </form>

                <form>

                    <div className="typeBox">
                        {!props.input &&
                        <div className="typeBox__hint">Type a message</div>
                        }
                        <div
                            ref={editable}
                            className="typeBox__editable"
                            contentEditable="true"
                            spellCheck="true"
                            onInput={event => props.setInput(event.target.innerHTML)}
                            onKeyDown={(e) => {if (e.keyCode === 13 && !e.shiftKey) props.sendMessage(e)}}
                        />
                    </div>
                    <button onClick={props.sendMessage} type="submit">Send a message</button>
                </form>

                <Tooltip title="Send" placement="top">
                    <IconButton onClick={props.sendMessage}>
                        <Send />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    )
}

export default ChatFooter;