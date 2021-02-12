import React from 'react';
import Moment from "react-moment";
import {markOccurrences} from "../Helpers";

const dateFormat = 'H:mm';

function SearchMessageResult(props) {

    const data = props.messageData;

    return(
        <div className="searchResult__message" onClick={() => props.onClick(data)}>
            <div className="searchResult__message__header">
                <Moment unix format={dateFormat}>{data.timestamp}</Moment>
            </div>
            <div className="searchResult__message__body">
                <span className="searchResult__message__body__type">{data.type}</span>
                <span className="searchResult__message__body__text" dangerouslySetInnerHTML={{__html: markOccurrences(data.text, props.keyword)}} />
            </div>
        </div>
    )
}

export default SearchMessageResult;