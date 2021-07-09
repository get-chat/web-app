import React from "react";
import Moment from "react-moment";
import {CALENDAR_SHORT} from "../../../Constants";
import {generateMessagePreview} from "../../../helpers/Helpers";
import {useHistory} from "react-router-dom";
import {Link} from "@material-ui/core";

function FailedBulkMessageNotification(props) {

    const history = useHistory();

    const handleClick = () => {
        history.push(`/main/chat/${props.data.waId}`);
    }

    const extractReasonFromResponsePayload = (responsePayload) => {
        const preparedResponsePayload = responsePayload.replace("b'", "").replace("}'", "}");
        try {
            return JSON.parse(preparedResponsePayload).reason;
        } catch (e) {
            return responsePayload
        }
    }

    return (
        <div className="notification error">
            <h3>Bulk message (ID: {props.data.id}) couldn't be sent to a recipient.</h3>
            <div className="mb-1">Recipient: <Link href="#" onClick={handleClick} className="bold">{props.data.waId}</Link></div>
            <div className="mb-1">
                Message: <span className="bold">{generateMessagePreview(props.data.task.payload)}</span>
            </div>
            <div className="mb-2">Status code: <span className="bold">{props.data.statusCode}</span></div>
            <div className="mb-2">
                <code className="notification__code">
                    {extractReasonFromResponsePayload(props.data.response)}
                </code>
            </div>
            <div className="notification__timestamp">
                <Moment date={props.data.timestamp} unix calendar={CALENDAR_SHORT} />
            </div>
        </div>
    )
}

export default FailedBulkMessageNotification;