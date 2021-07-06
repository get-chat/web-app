import React, {useEffect, useState} from "react";
import '../../styles/BulkSendIndicator.css';
import {LinearProgress} from "@material-ui/core";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_BULK_MESSAGE_TASK} from "../../Constants";
import {getObjLength} from "../../helpers/Helpers";

function BulkSendIndicator(props) {

    const [tasks, setTasks] = useState({});

    useEffect(() => {
        const onBulkMessageTask = function (msg, data) {
            setTasks((prevState) => {
                Object.entries(data).forEach((curTask) => {
                    const task = curTask[1];
                    console.log(task);
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

    useEffect(() => {
        let timeout;

        if (getObjLength(tasks) > 0) {
            timeout = setTimeout(function () {
                const nextState = tasks;
                let changedAny = false;

                Object.entries(tasks).forEach((curTask) => {
                    const task = curTask[1];
                    if (task.done >= task.total) {
                        delete nextState[task.id];
                        changedAny = true;
                    }
                });

                if (changedAny) {
                    setTasks({...nextState});
                }
            }, 3000);
        }

        return () => {
            clearTimeout(timeout);
        }
    }, [tasks]);

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