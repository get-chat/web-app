import React from "react";

function FailedBulkMessageNotification(props) {
    return (
        <div className="notification">
            {JSON.stringify(props.data)}
        </div>
    )
}

export default FailedBulkMessageNotification;