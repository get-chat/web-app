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

function SearchMessage(props) {

    const [keyword, setKeyword] = useState();
    const {waId} = useParams();

    let cancelToken;
    let source;

    const generateCancelToken = () => {
        cancelToken = axios.CancelToken;
        source = cancelToken.source();
    }

    // Generating cancel token
    generateCancelToken();

    const hideSearchMessages = () => {
        PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, false);
    }

    useEffect(() => {
        // Cancelling previous request
        // TODO: Add a promise to continue with next request
        source.cancel();
        if (keyword && keyword.trim().length > 0) {
            search(keyword.trim());
        }
    }, [keyword]);

    const search = (_keyword) => {
        console.log(_keyword);

        axios.get( `${BASE_URL}messages/${waId}/`,
            getConfig({
                //offset: offset ?? 0,
                limit: 30,
                keyword: _keyword
            }, source.token)
        )
            .then((response) => {
                console.log("Messages", response.data);

                const preparedMessages = {};
                response.data.results.reverse().map((message, index) => {
                    const prepared = new ChatMessageClass(message);
                    preparedMessages[prepared.id] = prepared;
                });

            })
            .catch((error) => {
                // TODO: Handle errors

                //displayError(error);
            });
    }

    return (
        <div className="searchMessage">
            <div className="searchMessage__header">
                <IconButton onClick={() => hideSearchMessages()}>
                    <CloseIcon />
                </IconButton>

                <h3>Search For Messages</h3>
            </div>

            <SearchBar onChange={setKeyword} />

            <div className="searchMessage__body">

            </div>
        </div>
    )
}

export default SearchMessage;