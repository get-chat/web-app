import React, {useEffect, useState} from "react";
import '../../styles/BulkSendIndicator.css';
import {LinearProgress} from "@material-ui/core";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT, EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR} from "../../Constants";

function BulkSendIndicator(props) {

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onBulkMessageTaskElement = function (msg, data) {
            console.log(data);
        }

        const bulkMessageTaskElementEventToken = PubSub.subscribe(EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT, onBulkMessageTaskElement);

        return () => {
            PubSub.unsubscribe(bulkMessageTaskElementEventToken);
        }
    }, []);

    return (
        <div className="bulkSendIndicator">
            <div className="mb-2">Sending</div>

            <LinearProgress variant="determinate" value={progress} />
        </div>
    )
}

export default BulkSendIndicator;