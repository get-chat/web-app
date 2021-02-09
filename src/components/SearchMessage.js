import React from 'react';
import '../styles/SearchMessage.css';
import {IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY} from "../Constants";

function SearchMessage(props) {

    const hideSearchMessages = () => {
        PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, false);
    }

    return (
        <div className="searchMessage">
            <div className="searchMessage__header">
                <IconButton onClick={() => hideSearchMessages()}>
                    <CloseIcon />
                </IconButton>

                <h3>Search For Messages</h3>
            </div>

            <div className="searchMessage__body">

            </div>
        </div>
    )
}

export default SearchMessage;