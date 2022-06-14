import React from "react";
import ChatMessageTypeIcon from "./ChatMessageTypeIcon";
import ChatMessageTypeLabel from "./ChatMessageTypeLabel";
import ReplyIcon from "@material-ui/icons/Reply";
import ChatMessageClass from "../../../../ChatMessageClass";
import PrintMessage from "../../../PrintMessage";

function ChatMessageShortContent(props) {
    const text = props.text ?? props.buttonText ?? props.interactiveButtonText;

    return (
        <div>
            {props.isLastMessageFromUs && <ReplyIcon className="replyIcon" />}

            <ChatMessageTypeIcon type={props.type} />

            {[
                ChatMessageClass.TYPE_TEXT,
                ChatMessageClass.TYPE_BUTTON,
            ].includes(props.type) ? (
                <PrintMessage message={text} />
            ) : (
                <span>
                    {props.caption && props.caption.length > 0 ? (
                        <PrintMessage message={props.caption} />
                    ) : (
                        <ChatMessageTypeLabel type={props.type} />
                    )}
                </span>
            )}
        </div>
    );
}

export default ChatMessageShortContent;
