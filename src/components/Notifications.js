import React, {useEffect, useRef, useState} from "react";
import {generateCancelToken, retrieveBulkMessageElementsCall} from "../api/ApiCalls";
import '../styles/Notifications.css';

function Notifications(props) {

    const [bulkMessageElements, setBulkMessageElements] = useState([]);
    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        cancelTokenSourceRef.current = generateCancelToken();
        retrieveBulkMessageElements();

        return () => {
            cancelTokenSourceRef.current.cancel();
        }
    }, []);

    const retrieveBulkMessageElements = () => {
        retrieveBulkMessageElementsCall(cancelTokenSourceRef.current.token,
            (response) => {
                setBulkMessageElements(response.results);
            }, (error) => {

            });
    }

    return (
        <div className="notificationsWrapper">
            <div className="notifications">

                <div className="notifications__header">
                    <h3>Notifications</h3>
                </div>

                <div className="notifications__body">
                    {bulkMessageElements.map((notification) =>
                        <div>{JSON.stringify(notification)}</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Notifications;