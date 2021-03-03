import React from "react";
import ChatMessageTypeIcon from "./ChatMessageTypeIcon";
import ChatMessageTypeLabel from "./ChatMessageTypeLabel";
import {replaceEmojis} from "../Helpers";
import ChatMessageClass from "../ChatMessageClass";

function ChatMessageShortContent(props) {
    return (
        <span>
            <ChatMessageTypeIcon type={props.type}/>

            {props.type === ChatMessageClass.TYPE_TEXT
                ?
                <span dangerouslySetInnerHTML={{__html: replaceEmojis(props.text, true)}} />
                :
                <span>
                    {(props.caption && props.caption.length > 0)
                        ?
                        <span>{props.caption}</span>
                        :
                        <ChatMessageTypeLabel type={props.type}/>
                    }
                </span>
            }
        </span>
    )
}

export default ChatMessageShortContent;