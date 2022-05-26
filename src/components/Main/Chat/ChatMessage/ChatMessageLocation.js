import React from "react";
import {Trans} from "react-i18next";

function ChatMessageLocation(props) {
    return (
        <div>
            <Trans>
                Location: <a href={props.data.generateLocationURL()} target="_blank">{props.data.location?.name}</a>
            </Trans>
        </div>
    )
}

export default ChatMessageLocation;
