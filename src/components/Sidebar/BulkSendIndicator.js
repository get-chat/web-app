import React, {useEffect, useState} from "react";
import '../../styles/BulkSendIndicator.css';
import {LinearProgress} from "@material-ui/core";
import PubSub from "pubsub-js";
import {CALENDAR_SHORT, EVENT_TOPIC_BULK_MESSAGE_TASK} from "../../Constants";
import {getObjLength} from "../../helpers/Helpers";
import Moment from "react-moment";

function BulkSendIndicator(props) {

    const [tasks, setTasks] = useState({});

    useEffect(() => {
        const onBulkMessageTask = function (msg, data) {
            setTasks((prevState) => {
                Object.entries(data).forEach((curTask) => {
                    const task = curTask[1];
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
        let intervalId;

        if (getObjLength(tasks) > 0) {
            intervalId = setInterval(function () {
                const nextState = tasks;
                let changedAny = false;
                const now = (new Date()).getTime();

                // Delete tasks after 5 seconds after their completion
                Object.entries(tasks).forEach((curTask) => {
                    const task = curTask[1];
                    if (task.done >= task.total) {
                        if (task.doneAt) {
                            const secondsPast = Math.floor((now - task.doneAt) / 1000);
                            if (secondsPast >= 5) {
                                delete nextState[task.id];
                                changedAny = true;
                            }
                        } else {
                            task.doneAt = now;
                            changedAny = true;
                        }
                    }
                });

                if (changedAny) {
                    setTasks({...nextState});
                }
            }, 1000);
        }

        return () => {
            clearInterval(intervalId);
        }
    }, [tasks]);

    return (
        <div className="bulkSendIndicatorWrapper">
            {Object.entries(tasks).map((task) =>
            <div className="bulkSendIndicator">
                <div className="mb-1">Sending ({task[1].done} / {task[1].total})</div>
                <div className="bulkSendIndicator__timestamp mb-2">Type: <span className="bold">{task[1].payload?.type}</span>, started at <Moment className="bold" date={task[1].timestamp} calendar={CALENDAR_SHORT} unix /></div>
                <LinearProgress variant="determinate" value={(task[1].done * 100) / task[1].total} />
            </div>
            )}
        </div>
    )
}

export default BulkSendIndicator;