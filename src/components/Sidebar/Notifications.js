import React, {useEffect, useRef, useState} from "react";
import {generateCancelToken, retrieveBulkMessageElementsCall} from "../../api/ApiCalls";
import '../../styles/Notifications.css';
import PubSub from "pubsub-js";
import {EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT} from "../../Constants";
import FailedBulkMessageNotification from "./Notifications/FailedBulkMessageNotification";
import BulkMessageTaskElementClass from "../../BulkMessageTaskElementClass";
import CloseIcon from "@material-ui/icons/Close";
import {IconButton} from "@material-ui/core";
import {getObjLength} from "../../helpers/Helpers";

function Notifications(props) {

    const [bulkMessageElements, setBulkMessageElements] = useState({});
    const [isLoaded, setLoaded] = useState(false);
    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        cancelTokenSourceRef.current = generateCancelToken();
        retrieveBulkMessageElements();

        const onBulkMessageTaskElement = function (msg, data) {
            if (data.status) {
                // Means a bulk message task element has failed, so we refresh the data
                retrieveBulkMessageElements();
            }
        }

        const bulkMessageTaskElementEventToken = PubSub.subscribe(EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT, onBulkMessageTaskElement);

        return () => {
            cancelTokenSourceRef.current.cancel();
            PubSub.unsubscribe(bulkMessageTaskElementEventToken);
        }
    }, []);

    const retrieveBulkMessageElements = () => {
        retrieveBulkMessageElementsCall(cancelTokenSourceRef.current.token,
            (response) => {
                const preparedBulkMessageTaskElements = {};
                response.data.results.forEach((taskElement) => {
                    const prepared = new BulkMessageTaskElementClass(taskElement);

                    // Check if failed
                    if (prepared.statusCode >= 400) {
                        preparedBulkMessageTaskElements[prepared.id] = prepared;
                    }
                });

                setBulkMessageElements(preparedBulkMessageTaskElements);
                setLoaded(true);
            }, (error) => {

            });
    }

    const hideNotifications = () => {
        props.onHide();
    }

    return (
        <div className="notifications">

            <div className="notifications__header">
                <IconButton onClick={hideNotifications}>
                    <CloseIcon />
                </IconButton>

                <h3>Notifications</h3>
            </div>

            <div className="notifications__body">
                {(isLoaded && getObjLength(bulkMessageElements) === 0) &&
                <div className="notifications__body__empty">
                    You have no notifications
                </div>
                }

                {Object.entries(bulkMessageElements).map((notification) =>
                    <FailedBulkMessageNotification key={notification[1].id} data={notification[1]} />
                )}
            </div>
        </div>
    )
}

export default Notifications;