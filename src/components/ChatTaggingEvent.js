import React from "react";
import '../styles/ChatTaggingEvent.css';

function ChatTaggingEvent(props) {
    return (
        <div className="chatTaggingEvent">
            <div className="chatTaggingEvent__content">
                <div className="chatTaggingEvent__content__title">
                    <span className="bold">{props.data.done_by?.username}</span> has {props.data.action} tag: <span className="bold" style={{color: props.data.tag?.web_inbox_color}}>{props.data.tag?.name}</span>.
                </div>

                {/*{JSON.stringify(props.data)}*/}
            </div>
        </div>
    )
}

export default ChatTaggingEvent;