import React from "react";
import Moment from "react-moment";

function MessageDateIndicator(props) {

    const calendarStrings = {
        lastDay: '[Yesterday]',
        sameDay: '[Today]',
        lastWeek: 'dddd',
        sameElse: 'MMMM d, yyyy'
    };

    return (
        <div className="chat__message__dateContainer">
            <span className="chat__message__dateContainer__indicator">
                {props.text !== undefined
                    ?
                    <span dangerouslySetInnerHTML={{__html: props.text}} />
                    :
                    <Moment calendar={calendarStrings} date={props.timestamp} unix />
                }
            </span>
        </div>
    )
}

export default MessageDateIndicator;