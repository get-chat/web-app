import React from "react";

function ChatMessageLocation(props) {
    return (
        <div>
            Location: <a href={props.data.generateLocationURL()} target="_blank">{props.data.location?.name}</a>
        </div>
    )
}

export default ChatMessageLocation;
