import React from "react";
import {Button} from "@material-ui/core";
import '../../../styles/BulkSendActions.css';

function BulkSendActions(props) {
    return (
        <div className="bulkSendActions">

            <h3>Bulk Send</h3>

            <div className="bulkSendActions__recipients">
                Selected {props.selectedChats.length} contact(s) and {props.selectedTags.length} tag(s).
            </div>

            <div className="bulkSendActions__actions">
                <Button color="secondary" onClick={props.cancelSelection}>Cancel</Button>
                <Button color="primary" onClick={props.finishBulkSendMessage}>Send</Button>
            </div>

        </div>
    )
}

export default BulkSendActions;