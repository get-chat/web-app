import React from "react";
import '../styles/ChatTaggingEvent.css';
import Moment from "react-moment";

function ChatTaggingEvent(props) {

    const dateFormat = 'H:mm';

    return (
        <div className="chatTaggingEvent">
            <div className="chatTaggingEvent__content">
                <div className="chatTaggingEvent__content__title">
                    <span className="bold">{props.data.done_by?.username}</span> has {props.data.action} tag: <span
                    className="bold" style={{color: props.data.tag?.web_inbox_color}}>{props.data.tag?.name}</span>.
                </div>

                <div className="chatTaggingEvent__content__timestamp">
                    <Moment date={props.data.timestamp} format={dateFormat} unix/>
                </div>
            </div>
        </div>
    )
}

export default ChatTaggingEvent;