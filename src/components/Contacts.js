import React, {useEffect, useRef, useState} from "react";
import '../styles/Contacts.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig, getObjLength} from "../Helpers";
import SearchBar from "./SearchBar";
import {Button, CircularProgress, IconButton, InputAdornment, ListItem, TextField} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import DialpadIcon from '@material-ui/icons/Dialpad';
import Contact from "./Contact";
import ContactClass from "../ContactClass";

function Contacts(props) {

    const [keyword, setKeyword] = useState("");
    const [contacts, setContacts] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [isVerifying, setVerifying] = useState(false);
    const [isPhoneNumberFormVisible, setPhoneNumberFormVisible] = useState(false);

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

    let timeout = useRef();

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        if (keyword?.length > 0) {
            setLoading(true);

            timeout.current = setTimeout(function () {
                findContacts();
            }, 500);
        }

        return () => {
            cancelTokenSourceRef.current.cancel();
            clearTimeout(timeout.current);
            setLoading(false);
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

                setLoading(false);

            })
            .catch((error) => {
                console.log(error);
                window.displayError(error);
                setLoading(false);
            });
    }

    return (
        <div className="contacts">
            <div className="contacts__header">
                <IconButton onClick={props.onHide}>
                    <ArrowBack />
                </IconButton>

                <h3>New chat</h3>
            </div>

            <div className="contacts__startByPhoneNumberWrapper">
                <div className="contacts__startByPhoneNumber" onClick={() => setPhoneNumberFormVisible(prevState => !prevState)}>
                    <ListItem button>
                        <div className="contacts__startByPhoneNumber__inner">
                            <DialpadIcon />
                            <span>Start a chat with a phone number</span>
                        </div>
                    </ListItem>
                </div>

                {isPhoneNumberFormVisible &&
                <div className="contacts__startByPhoneNumberWrapper__formWrapper">
                    <TextField
                        label="Phone number"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">+</InputAdornment>,
                        }}
                    />
                    <Button color="primary">Start</Button>
                </div>
                }
            </div>

            <SearchBar
                placeholder="Search for contacts"
                onChange={setKeyword}
                isLoading={isLoading} />

            <div className="contacts__body">
                {keyword?.length === 0 &&
                <span className="contacts__body__hint">Enter a keyword to start searching for contacts</span>
                }

                { Object.entries(contacts).map((contact, index) =>
                    <Contact
                        key={index}
                        data={contact[1]}
                        setVerifying={setVerifying}
                        onHide={props.onHide} />
                )}

                {isVerifying &&
                <div className="contacts__body__loading">
                    <CircularProgress color="inherit" />
                </div>
                }

                {(keyword?.length > 0 && getObjLength(contacts) === 0 && !isLoading) &&
                <span className="contacts__body__hint">No contacts found for <span
                    className="searchOccurrence">{keyword}</span></span>
                }
            </div>
        </div>
    )
}

export default Contacts;