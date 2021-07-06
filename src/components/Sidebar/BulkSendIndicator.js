import React, {useEffect, useState} from "react";
import '../../styles/BulkSendIndicator.css';
import {LinearProgress} from "@material-ui/core";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_BULK_MESSAGE_TASK} from "../../Constants";

function BulkSendIndicator(props) {

    const [tasks, setTasks] = useState({/*15: {id: 15, total: 2, done: 1, timestamp: 1625495133}*/});

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
        <div className="bulkSendIndicatorWrapper">
            {Object.entries(tasks).map((task) =>
            <div className="bulkSendIndicator">
                <div className="mb-2">Sending (Task {task[1].id})</div>
                <LinearProgress variant="determinate" value={(task[1].done * 100) / task[1].total} />
            </div>
            )}
        </div>
    )
}

export default BulkSendIndicator;