import React, {useEffect, useRef, useState} from "react";
import '../styles/Contacts.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import SearchBar from "./SearchBar";
import {CircularProgress, IconButton} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import Contact from "./Contact";
import ContactClass from "../ContactClass";

function Contacts(props) {

    const [keyword, setKeyword] = useState("");
    const [contacts, setContacts] = useState({});
    const [isVerifying, setVerifying] = useState(false);

    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        const handleKey = (event) => {
            if (event.keyCode === 27) { // Escape
                props.onHide();
            }
        }

        document.addEventListener('keydown', handleKey);

        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        findContacts();

        return () => {
            document.removeEventListener('keydown', handleKey);
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
            search: keyword?.trim()
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

                window.displayError(error);
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

            { keyword?.length === 0
                ?
                <div className="contacts__body">
                    <span className="contacts__body__hint">Enter a keyword to start searching</span>
                </div>
                :
                <div className="contacts__body">
                    { Object.entries(contacts).map((contact, index) =>
                        <Contact
                            key={index}
                            data={contact[1]}
                            setVerifying={setVerifying} />
                    )}

                    {isVerifying &&
                    <div className="contacts__body__loading">
                        <CircularProgress color="inherit" />
                    </div>
                    }
                </div>
            }
        </div>
    )
}

export default Contacts;