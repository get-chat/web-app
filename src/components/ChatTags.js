import React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";

function ChatTags(props) {

    const close = () => {

    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>Chat tags</DialogTitle>
            <DialogContent>
                Tags
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChatTags;