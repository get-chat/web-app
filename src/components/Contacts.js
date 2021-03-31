import React, {useEffect, useRef, useState} from "react";
import '../styles/Contacts.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import SearchBar from "./SearchBar";
import {IconButton} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";

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
        <div className="contacts">
            <div className="contacts__header">
                <IconButton onClick={props.onHide}>
                    <ArrowBack />
                </IconButton>

                <h3>Contacts</h3>
            </div>

            <SearchBar
                onChange={setKeyword} />

        </div>
    )
}

export default Contacts;