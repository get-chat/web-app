import React from "react";
import {Button} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import SearchBar from "./SearchBar";

function TemplateMessages(props) {

    const templates = props.templatesData;

    return (
        <div className="templateMessagesOuter">

            {/*<SearchBar />*/}

            {props.isLoadingTemplates
                ?
                <Alert severity="info">Loading template messages...</Alert>
                :
                <div className="templateMessages">

                    {Object.entries(templates).map((message, index) =>
                        <div key={message[0]} className="templateMessageWrapper">

                            <div className="chat__templateMsg chat__message chat__receiver">
                                <span
                                    className={"templateMessage__status " + message[1].status}>{message[1].status}</span>
                                <span className="templateMessage__message">{message[1].text}</span>
                            </div>

                            {message[1].status === "approved" &&
                            <Button onClick={() => props.onSend(message[1])}>Send</Button>
                            }

                        </div>
                    )}

                </div>
            }
        </div>
    )
}

export default TemplateMessages;