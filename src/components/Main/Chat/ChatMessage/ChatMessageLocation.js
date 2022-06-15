import React from "react";

function ChatMessageLocation(props) {
    return (
        <div className="chat__location">
            <iframe
                width="250"
                height="150"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBRFww39NCTTlCkU8LYMZMeiQ4xjt3BAZM&&q=${props.data.location?.latitude},${props.data.location?.longitude}&q=`}>
            </iframe>
        </div>
    )
}

export default ChatMessageLocation;
