import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import SearchBar from "./SearchBar";

function Contacts(props) {

    const [keyword, setKeyword] = useState("");

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
        axios.get(`${BASE_URL}contacts/`, getConfig({
            search: keyword
        }, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log("Contacts list", response.data);

            })
            .catch((error) => {
                console.log(error);

                props.displayError(error);
            });
    }

    return (
        <div>
            <SearchBar
                onChange={setKeyword} />

        </div>
    )
}

export default Contacts;