import React, {useState} from "react";
import {getObjLength} from "../../../helpers/Helpers";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";

function SavedResponses(props) {

    const [deleteId, setDeleteId] = useState();
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const sendSavedResponse = (id) => {
        props.sendCustomTextMessage(props.savedResponses[id].text);
    }

    const attemptToDelete = (id) => {
        setDeleteId(id);
        setOpen(true);
    }

    const deleteSavedResponse = () => {
        props.deleteSavedResponse(deleteId);
        setOpen(false);
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

                        <Button onClick={() => sendSavedResponse(savedResponse[0])}>Send</Button>
                        <Button onClick={() => attemptToDelete(savedResponse[0])}>Delete</Button>

                    </div>
                )}

            </div>

            <Dialog
                open={open}
                onClose={handleClose}>
                <DialogTitle>Oops!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this saved response?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        No
                    </Button>
                    <Button onClick={deleteSavedResponse} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default SavedResponses;