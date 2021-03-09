import React from "react";
import ChatMessageTypeIcon from "./ChatMessageTypeIcon";
import ChatMessageTypeLabel from "./ChatMessageTypeLabel";
import {replaceEmojis} from "../Helpers";
import ChatMessageClass from "../ChatMessageClass";

function ChatMessageShortContent(props) {
    return (
        <span>
            <ChatMessageTypeIcon type={props.type}/>

            {(props.type === ChatMessageClass.TYPE_TEXT || props.type === ChatMessageClass.TYPE_BUTTON)
                ?
                <span dangerouslySetInnerHTML={{__html: replaceEmojis(props.text ?? props.buttonText, true)}} />
                :
                <span>
                    {(props.caption && props.caption.length > 0)
                        ?
                        <span dangerouslySetInnerHTML={{__html: props.caption}} />
                        :
                        <ChatMessageTypeLabel type={props.type}/>
                    }
                </span>
            }
        </span>
    )
}

export default ChatMessageShortContent;