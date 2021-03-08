import React, {useState} from "react";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import CloseIcon from "@material-ui/icons/Close";
import SpeedDial from "@material-ui/lab/SpeedDial";
import {SpeedDialAction} from "@material-ui/lab";

export function AttachmentTypesMenu() {
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);

    const handleVisibility = () => {
        setHidden((prevHidden) => !prevHidden);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <SpeedDial
            icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
            ariaLabel="Send a file"
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}>

            <SpeedDialAction
                key="document"
                title="Document"
                icon="Like"/>

            <SpeedDialAction
                key="image"
                title="Image"
                icon="Camera"/>

        </SpeedDial>
    )
}