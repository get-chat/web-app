import React from "react";
import ChatMessageTypeIcon from "./ChatMessageTypeIcon";
import {ATTACHMENT_TYPE_IMAGE} from "../Constants";
import '../styles/ContextChatMessage.css';

function ContextChatMessage(props) {
    return (
        <div className="chat__message__context" onClick={() => props.goToMessageId(props.contextMessage.id, props.contextMessage.timestamp)}>
            <div className="chat__message__context__info">
                        <span className="chat__message__context__info__sender">
                            {props.contextMessage.senderName}
                        </span>
                <span className="chat__message__context__info__message">
                            <ChatMessageTypeIcon type={props.contextMessage.type} />
                    {props.contextMessage.text}
                    {props.contextMessage.caption}
                        </span>
            </div>

            {props.contextMessage.type === ATTACHMENT_TYPE_IMAGE &&
            <div className="chat__message__context__preview">
                <img src={props.contextMessage.generateImageLink()} alt={props.contextMessage.caption} />
            </div>
            }

            {/*<div>Image</div>*/}
        </div>
    )
}

export default ContextChatMessage;