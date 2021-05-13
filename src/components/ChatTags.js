import React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";

function ChatTags(props) {

    const close = () => {
        props.setOpen(false);
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>Chat tags</DialogTitle>
            <DialogContent>
                <div>You can add or remove tags for this chat</div>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChatTags;