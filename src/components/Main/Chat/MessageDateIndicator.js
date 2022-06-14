import React from "react";
import Moment from "react-moment";
import { CALENDAR_SHORT_DAYS } from "../../../Constants";

function MessageDateIndicator(props) {
    return (
        <div className="chat__message__dateContainer">
            <span className="chat__message__dateContainer__indicator">
                {/* TODO: <time {...} /> */}
                {props.text !== undefined ? (
                    <span dangerouslySetInnerHTML={{ __html: props.text }} />
                ) : (
                    <Moment
                        calendar={CALENDAR_SHORT_DAYS}
                        date={props.timestamp}
                        unix
                    />
                )}
            </span>
        </div>
    );
}

export default MessageDateIndicator;
