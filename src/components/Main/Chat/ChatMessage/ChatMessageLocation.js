import React from "react";

function ChatMessageLocation(props) {
    return (
        <iframe
            className="chat__location"
            width="250"
            height="150"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${window.config.APP_GOOGLE_MAPS_API_KEY}&&q=${props.data.location?.latitude},${props.data.location?.longitude}&q=`}>
        </iframe>
    )
}

export default ChatMessageLocation;
