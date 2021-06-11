import React from "react";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

function ChatMessageDocument(props) {
    return (
        <a href={props.data.documentLink ?? props.data.getHeaderFileLink('document')} target="_blank" className="chat__document">
            <InsertDriveFileIcon fontSize="small" />
            <span className="chat__document__filename">{props.data.documentCaption ?? (props.data.documentFileName ?? 'Document')}</span>
        </a>
    )
}

export default ChatMessageDocument;