import React, {useEffect, useState} from "react";
import '../../styles/BulkSendIndicator.css';
import {LinearProgress} from "@material-ui/core";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_BULK_MESSAGE_TASK} from "../../Constants";

function BulkSendIndicator(props) {

    const [tasks, setTasks] = useState({});
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onBulkMessageTask = function (msg, data) {
            console.log(data);

            setTasks((prevState) => {
                Object.entries(data).forEach((task) => {
                    if (!(task.id in task) || task.done > tasks[task.id].done) {
                        prevState[task.id] = task;
                    }
                });

                return {...prevState};
            });
        }

        const bulkMessageTaskElementToken = PubSub.subscribe(EVENT_TOPIC_BULK_MESSAGE_TASK, onBulkMessageTask);

        return () => {
            PubSub.unsubscribe(bulkMessageTaskElementToken);
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