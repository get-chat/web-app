import React from "react";
import {
    extractFailedWaIds,
    getFirstFailedPendingMessage,
    setAllFailedPendingMessagesWillRetry
} from "../../../helpers/PendingMessagesHelper";
import '../../../styles/RetryFailedMessages.css';
import {Alert} from "@material-ui/lab";
import {useHistory} from "react-router-dom";

function RetryFailedMessages(props) {

    const history = useHistory();

    const resendMessage = () => {
        // Set all failed pending message as willRetry so queue will retry automatically
        props.setPendingMessages([...setAllFailedPendingMessagesWillRetry()]);

        // Switch to chat of first failed message
        const firstFailedMessage = getFirstFailedPendingMessage(props.pendingMessages);
        const waId = firstFailedMessage.requestBody?.wa_id;
        if (waId) {
            history.push(`/main/chat/${waId}`);
        }
    }

    const generateFailedReceiversString = () => {
        const failedWaIds = extractFailedWaIds(props.pendingMessages);
        let namesArray = [];
        failedWaIds.forEach((waId) => {
            namesArray.push(props.contactProvidersData[waId]?.[0]?.name ?? props.chats[waId]?.name);
        });

        return namesArray.join(', ');
    }

    return (
        <div className="retryFailedMessagesWrapper">
            <Alert
                className={"retryFailedMessages" + (props.isSendingPendingMessages ? " sending" : "")}
                severity="error"
                elevation={0}>
                Failed to send messages to {generateFailedReceiversString()}. <a href="#" className="bold" onClick={resendMessage}>Click</a> to retry.<br />
            </Alert>
        </div>
    )
}

export default RetryFailedMessages;