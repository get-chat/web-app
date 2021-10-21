import React from "react";
import {extractFailedWaIds, setAllFailedPendingMessagesWillRetry} from "../../../helpers/PendingMessagesHelper";
import '../../../styles/RetryFailedMessages.css';

function RetryFailedMessages(props) {

    const resendMessage = () => {
        // Set all failed pending message as willRetry so queue will retry automatically
        props.setPendingMessages([...setAllFailedPendingMessagesWillRetry()]);
    }

    return (
        <div className="retryFailedMessagesWrapper">
            <div className={"retryFailedMessages" + (props.isSendingPendingMessages ? " sending" : "")}>
                Failed to send messages to {JSON.stringify(extractFailedWaIds(props.pendingMessages))}. <a onClick={resendMessage}>Click</a> to retry.<br />
            </div>
        </div>
    )
}

export default RetryFailedMessages;