import React, {useState} from "react";
import {Button, Dialog, TextField} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";

function ChangePasswordDialog(props) {

    const [newPassword, setNewPassword] = useState('');
    const [isRequesting, setRequesting] = useState(false);

    const close = () => {
        props.setOpen(false);
    }

    const changePassword = async () => {
        if (newPassword.length === 0) return;

        setRequesting(true);

        axios.put(`${BASE_URL}users/password/change/`, {
            password: newPassword
        }, getConfig()).then((response) => {
            setRequesting(false);

            // Hide the dialog
            close();

        }).catch((error) => {
            setRequesting(false);
        });
    }

    return (
        <Dialog open={props.open} onClose={close}>

            <DialogTitle>Change your password</DialogTitle>
            <DialogContent>
                <div>
                    <TextField
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        label="New password"
                        type="password"
                        autoFocus
                        fullWidth />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Cancel</Button>
                <Button onClick={changePassword} color="primary" disabled={isRequesting}>Change</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChangePasswordDialog;