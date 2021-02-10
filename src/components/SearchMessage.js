import React, {useEffect, useState} from 'react';
import '../styles/SearchMessage.css';
import {IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {BASE_URL, EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY} from "../Constants";
import SearchBar from "./SearchBar";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getConfig} from "../Helpers";
import ChatMessageClass from "../ChatMessageClass";
import SearchMessageResult from "./SearchMessageResult";

function SearchMessage(props) {

    const [results, setResults] = useState({});
    const {waId} = useParams();

    useEffect(() => {
        setResults({});
    }, [waId]);

    const hideSearchMessages = () => {
        PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, false);
    }

    let cancelToken;

    const search = async (keyword) => {
        // Check if there are any previous pending requests
        if (cancelToken !== undefined) {
            cancelToken.cancel("Operation canceled due to new request.");
        }

        // Generate a token
        cancelToken = axios.CancelToken.source();

        if (keyword.trim().length === 0) {
            setResults({});
            return false;
        }

        axios.get( `${BASE_URL}messages/${waId}/`,
            getConfig({
                //offset: offset ?? 0,
                limit: 30,
                keyword: keyword
            }, cancelToken.token)
        )
            .then((response) => {
                console.log("Messages", response.data);

                const preparedMessages = {};
                response.data.results.reverse().map((message, index) => {
                    const prepared = new ChatMessageClass(message);
                    preparedMessages[prepared.id] = prepared;
                });

                setResults(preparedMessages);

            })
            .catch((error) => {
                // TODO: Handle errors

                if (axios.isCancel(error)) {
                    console.error("Cancelled");
                }

                //displayError(error);
            });
    }

    const goToMessage = (id) => {
        console.log(id);
    }

    return (
        <div className="searchMessage">
            <div className="searchMessage__header">
                <IconButton onClick={hideSearchMessages}>
                    <CloseIcon />
                </IconButton>

                <h3>Search For Messages</h3>
            </div>

            <SearchBar onChange={search} />

            <div className="searchMessage__body">

                { Object.entries(results).map((message, index) =>
                    <SearchMessageResult
                        key={message[0]}
                        messageData={message[1]}
                        onClick={(id) => goToMessage(id)}/>
                )}

            </div>
        </div>
    )
}

export default SearchMessage;