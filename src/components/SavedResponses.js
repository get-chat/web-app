import React from "react";
import {getObjLength} from "../Helpers";
import {Button} from "@material-ui/core";

function SavedResponses(props) {

    const send = (id) => {

    }

    return (
        <div className="savedResponsesOuter">
            <div className="savedResponses">

                {getObjLength(props.savedResponses) === 0 &&
                <div className="savedResponses__emptyInfo mt-3">No response message have been saved yet.</div>
                }

                {Object.entries(props.savedResponses).map((savedResponse, index) =>
                    <div key={savedResponse[0]} className="savedResponseWrapper">

                        <div className="chat__savedResponse chat__message chat__outgoing">
                            {/*<span className={"templateMessage__status " + savedResponse[1].status}>{savedResponse[1].status}</span>*/}
                            <div className="savedResponse__message">
                                {savedResponse[1].text}
                            </div>
                        </div>

                        <Button onClick={() => send(savedResponse[1])}>Send</Button>

                    </div>
                )}

            </div>
        </div>
    )
}

export default SavedResponses;