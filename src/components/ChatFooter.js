import React, {useRef} from 'react';
import {IconButton, Tooltip} from "@material-ui/core";
import {AttachFile, InsertEmoticon, Send} from "@material-ui/icons";
import SubjectIcon from "@material-ui/icons/Subject";

function ChatFooter(props) {

    const fileInput = useRef(null);

    const handleAttachmentClick = () => {
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

            <Tooltip title="Emoji">
                <IconButton>
                    <InsertEmoticon/>
                </IconButton>
            </Tooltip>

            <Tooltip title="Attachment">
                <IconButton onClick={handleAttachmentClick}>
                    <AttachFile />
                </IconButton>
            </Tooltip>

            <Tooltip title="Templates">
                <IconButton onClick={toggleTemplateMessages}>
                    <SubjectIcon />
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

            <IconButton onClick={props.sendMessage}>
                <Send />
            </IconButton>

        </div>
    )
}

export default ChatFooter;