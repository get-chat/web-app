import React from "react";
import '../styles/ChatTaggingEvent.css';

function ChatTaggingEvent(props) {
    return (
        <div className="chatTaggingEvent">
            <div className="chatTaggingEvent__content">
                <div className="chatTaggingEvent__content__title">
                    <span className="bold">{props.data.done_by?.username}</span> has changed tags.
                </div>

                {/*{JSON.stringify(props.data)}*/}
            </div>
        </div>
    )
}

export default ChatTaggingEvent;