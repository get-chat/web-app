import React from "react";
import ChatMessageClass from "../../../../ChatMessageClass";

function ChatMessageTypeLabel(props) {
    return (
        <span className="chatMessageTypeLabel">
            {props.type === ChatMessageClass.TYPE_IMAGE &&
            <span>Image</span>
            }

            {props.type === ChatMessageClass.TYPE_VIDEO &&
            <span>Video</span>
            }

            {props.type === ChatMessageClass.TYPE_VOICE &&
            <span>Voice</span>
            }

            {props.type === ChatMessageClass.TYPE_AUDIO &&
            <span>Audio</span>
            }

            {props.type === ChatMessageClass.TYPE_DOCUMENT &&
            <span>Document</span>
            }

            {props.type === ChatMessageClass.TYPE_STICKER &&
            <span>Sticker</span>
            }

            {props.type === ChatMessageClass.TYPE_TEMPLATE &&
            <span>Template</span>
            }
        </span>
    )
}

export default ChatMessageTypeLabel;