import React, {useEffect, useRef, useState} from "react";
import {generateCancelToken, retrieveBulkMessageTaskElementsCall} from "../../api/ApiCalls";
import '../../styles/Notifications.css';
import PubSub from "pubsub-js";
import {EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT} from "../../Constants";
import FailedBulkMessageNotification from "./Notifications/FailedBulkMessageNotification";
import BulkMessageTaskElementClass from "../../BulkMessageTaskElementClass";
import CloseIcon from "@material-ui/icons/Close";
import {IconButton} from "@material-ui/core";
import {getObjLength} from "../../helpers/Helpers";

function Notifications(props) {

    const [bulkMessageTaskElements, setBulkMessageTaskElements] = useState({});
    const [isLoaded, setLoaded] = useState(false);
    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        const handleKey = (event) => {
            if (event.keyCode === 27) { // Escape
                props.onHide();
            }
        }

        document.addEventListener('keydown', handleKey);

        // Retrieve bulk message task elements
        cancelTokenSourceRef.current = generateCancelToken();
        retrieveBulkMessageTaskElements();

        const onBulkMessageTaskElement = function (msg, data) {
            if (data.status) {
                // Means a bulk message task element has failed, so we refresh the data
                retrieveBulkMessageTaskElements();
            }
        }

        const bulkMessageTaskElementEventToken = PubSub.subscribe(EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT, onBulkMessageTaskElement);

        return () => {
            document.removeEventListener('keydown', handleKey);
            cancelTokenSourceRef.current.cancel();
            PubSub.unsubscribe(bulkMessageTaskElementEventToken);
        }
    }, []);

    const retrieveBulkMessageTaskElements = () => {
        retrieveBulkMessageTaskElementsCall(cancelTokenSourceRef.current.token,
            (response) => {
                const preparedBulkMessageTaskElements = {};
                response.data.results.forEach((taskElement) => {
                    const prepared = new BulkMessageTaskElementClass(taskElement);

                    // TODO: Results should be ordered DESC in the backend
                    // Check if failed
                    if (prepared.statusCode >= 400) {
                        preparedBulkMessageTaskElements[prepared.id] = prepared;
                    }
                });

                setBulkMessageTaskElements(preparedBulkMessageTaskElements);
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
                {(isLoaded && getObjLength(bulkMessageTaskElements) === 0) &&
                <div className="notifications__body__empty">
                    You have no notifications
                </div>
                }

                {Object.entries(bulkMessageTaskElements).reverse().map((notification) =>
                    <FailedBulkMessageNotification key={notification[1].id} data={notification[1]} />
                )}
            </div>
        </div>
    )
}

export default Notifications;