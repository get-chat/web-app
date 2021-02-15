import React from "react";
import Moment from "react-moment";

function MessageDateIndicator(props) {
    return (
        <div className="chat__message__dateContainer">
            <span className="chat__message__dateContainer__indicator">
                {props.text !== undefined
                    ?
                    <span dangerouslySetInnerHTML={{__html: props.text}} />
                    :
                    <Moment date={props.timestamp} format={props.format} unix/>
                }
            </span>
        </div>
    )
}

export default MessageDateIndicator;