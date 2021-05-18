import React from "react";
import '../styles/ChatTaggingEvent.css';

function ChatTaggingEvent(props) {
    return (
        <div className="chatTaggingEvent">
            {JSON.stringify(props.data)}
        </div>
    )
}

export default ChatTaggingEvent;