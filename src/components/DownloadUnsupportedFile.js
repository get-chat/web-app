import React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";

function DownloadUnsupportedFile(props) {

    const close = () => {
        props.setOpen(false);
    }

    const download = () => {
        window.open(props.data.link, '_blank').focus();
        close();
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>
                Unsupported file type
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    This file type is not supported. But you can still download it.
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button onClick={download} color="primary">Download</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DownloadUnsupportedFile;