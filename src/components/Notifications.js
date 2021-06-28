import React, {useEffect, useRef, useState} from "react";
import {retrieveBulkMessageElementsCall} from "../api/ApiCalls";
import '../styles/Notifications.css';

function Notifications(props) {

    const [bulkMessageElements, setBulkMessageElements] = useState([]);
    let cancelTokenSourceRef = useRef();

    useEffect(() => {
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
        <div>
            {bulkMessageElements.map((notification) =>
                <div>{JSON.stringify(notification)}</div>
            )}
        </div>
    )
}