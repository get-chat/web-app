import React, {useEffect, useRef, useState} from "react";
import '../styles/Contacts.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import SearchBar from "./SearchBar";
import {IconButton} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import Contact from "./Contact";
import ContactClass from "../ContactClass";

function Contacts(props) {

    const [keyword, setKeyword] = useState("");
    const [contacts, setContacts] = useState({});

    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        findContacts();

        return () => {
            cancelTokenSourceRef.current.cancel();
        }
    }, []);

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        findContacts();

        return () => {
            cancelTokenSourceRef.current.cancel();
        }
    }, [keyword]);

    const findContacts = () => {
        axios.get(`${BASE_URL}contacts/`, getConfig({
            search: keyword
        }, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log("Contacts list", response.data);

                const preparedContacts = {};
                response.data.results.forEach((contact, contactIndex) => {
                    preparedContacts[contactIndex] = new ContactClass(contact);
                });

                setContacts(preparedContacts);

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

            <div className="contacts__body">
                { Object.entries(contacts).map((contact, index) =>
                    <Contact key={index} data={contact[1]} />
                )}
            </div>

        </div>
    )
}

export default Contacts;