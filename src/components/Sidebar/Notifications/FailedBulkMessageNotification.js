import React from "react";
import Moment from "react-moment";
import {CALENDAR_SHORT} from "../../../Constants";

function FailedBulkMessageNotification(props) {
    return (
        <div className="notification error">
            <h3>Bulk message (ID: {props.data.id}) failed.</h3>
            <div className="mb-1">Recipient: {props.data.waId}</div>
            <div className="mb-1">Status code: <span className="bold">{props.data.statusCode}</span></div>
            <code className="notification__code mb-2">{props.data.response}</code>
            <div className="notification__timestamp">
                <Moment date={props.data.timestamp} unix calendar={CALENDAR_SHORT} />
            </div>
        </div>
    )
}

export default FailedBulkMessageNotification;