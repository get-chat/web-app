import React from "react";
import Moment from "react-moment";
import {CALENDAR_SHORT} from "../../../Constants";

function FailedBulkMessageNotification(props) {
    return (
        <div className="notification">
            <h3>Bulk message ({props.data.id}) failed.</h3>
            <div>{props.data.response}</div>
            <div>{props.data.statusCode}</div>
            <div className="notification__timestamp">
                <Moment date={props.data.timestamp} unix calendar={CALENDAR_SHORT} />
            </div>
        </div>
    )
}

export default FailedBulkMessageNotification;