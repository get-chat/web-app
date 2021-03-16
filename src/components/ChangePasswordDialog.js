import React, {useEffect, useRef, useState} from "react";
import '../styles/ChangePasswordDialog.css';
import {Button, Dialog, TextField} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import {Alert, AlertTitle} from "@material-ui/lab";

function ChangePasswordDialog(props) {

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
    const [error, setError] = useState();
    const [isRequesting, setRequesting] = useState(false);
    const [isSuccess, setSuccess] = useState(false);

    const timeoutRef = useRef(0);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [timeoutRef]);

    const close = () => {
        // Close dialog
        props.setOpen(false);

        timeoutRef.current = setTimeout(function () {
            // Reset states
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordRepeat('');
            setError(undefined);
            setRequesting(false);
            setSuccess(false);
        }, 300);
    }

    const changePassword = async () => {
        if (currentPassword.length === 0 || newPassword.length === 0 || newPasswordRepeat.length === 0) {
            setError("You must fill all fields!");
            return;
        }

        if (newPassword !== newPasswordRepeat) {
            setError("Passwords must match!");
            return;
        }

        setSuccess(false);
        setError(undefined);
        setRequesting(true);

        axios.put(`${BASE_URL}users/password/change/`, {
            current_password: currentPassword,
            new_password: newPassword
        }, getConfig()).then((response) => {
            setRequesting(false);

            // Hide the dialog
            //close();

            setSuccess(true);

        }).catch((error) => {
            setRequesting(false);
            setError("An error has occurred.");
        });
    }

    return (
        <Dialog open={props.open} onClose={close} className="changePasswordDialog">

            <DialogTitle>Change password</DialogTitle>
            <DialogContent>
                <div className="changePasswordDialog__fields">
                    <TextField
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        label="Current password"
                        type="password"
                        autoFocus
                        fullWidth />

                    <TextField
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        label="New password"
                        type="password"
                        fullWidth />

                    <TextField
                        value={newPasswordRepeat}
                        onChange={(event) => setNewPasswordRepeat(event.target.value)}
                        label="New password (repeat)"
                        type="password"
                        fullWidth />
                </div>
                {(error && !isSuccess) &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
                }
                {isSuccess &&
                <Alert severity="success">
                    <AlertTitle>Success</AlertTitle>
                    Changed password successfully
                </Alert>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button onClick={changePassword} color="primary" disabled={(isRequesting || isSuccess)}>Change</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChangePasswordDialog;