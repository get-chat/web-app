import React from 'react';
import Moment from "react-moment";

const dateFormat = 'H:mm';

function SearchMessageResult(props) {

    const waId = props.waId;
    const data = props.messageData;

    return(
        <div className="searchResult__message" onClick={() => props.onClick(data.id)}>
            <div className="searchResult__message__header">
                <Moment unix format={dateFormat}>{data.timestamp}</Moment>
            </div>
            <div className="searchResult__message__body">
                <span className="searchResult__message__body__type">{data.type}</span>
                <span className="searchResult__message__body__text">{data.text}</span>
            </div>
        </div>
    )
}

export default SearchMessageResult;