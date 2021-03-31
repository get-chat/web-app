import React, {useEffect, useRef} from "react";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";

function Contacts(props) {

    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        findContacts();

        return () => {
            cancelTokenSourceRef.current.cancel();
        }
    }, []);

    const findContacts = () => {
        axios.get(`${BASE_URL}contacts/`, getConfig(undefined, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log(response.data);

            })
            .catch((error) => {
                console.log(error);

                //props.displayError(error);
            });
    }

    return (
        <div>

        </div>
    )
}

export default Contacts;