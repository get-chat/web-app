import React, {useRef} from 'react';
import {IconButton, Tooltip} from "@material-ui/core";
import {AttachFile, InsertEmoticon, Send} from "@material-ui/icons";
import SmsIcon from '@material-ui/icons/Sms';
import ImageIcon from '@material-ui/icons/Image';
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

function ChatFooter(props) {

    const fileInput = useRef(null);

    const handleAttachmentClick = (acceptValue) => {
        fileInput.current.setAttribute('accept', acceptValue);
        fileInput.current.click();
    }

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

    return (
        <div className="chat__footer">

            <Tooltip title="Emoji" placement="top">
                <IconButton>
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
                        <IconButton className="chat__footer__attachmentContainer__options__document" onClick={() => handleAttachmentClick('application/*')}>
                            <InsertDriveFileIcon/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Images & Videos" placement="right">
                        <IconButton className="chat__footer__attachmentContainer__options__imageAndVideo" onClick={() => handleAttachmentClick('image/*, video/*')}>
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
                <textarea value={props.input} onKeyDown={(e) => {if (e.keyCode === 13 && !e.shiftKey) props.sendMessage(e)}} onChange={e => props.setInput(e.target.value)} placeholder="Type a message" />
                <button onClick={props.sendMessage} type="submit">Send a message</button>
            </form>

            <Tooltip title="Send" placement="top">
                <IconButton onClick={props.sendMessage}>
                    <Send />
                </IconButton>
            </Tooltip>
1
        </div>
    )
}

export default ChatFooter;