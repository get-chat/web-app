import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import {Button, Dialog} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import {useTranslation} from "react-i18next";

const SendBulkMessageDialog = ({open, setOpen}) => {
    const { t, i18n } = useTranslation();

    const close = () => {
        setOpen(false);
    }

    return (
        <Dialog open={open} onClose={close} className="changePasswordDialog">

            <DialogTitle>Change password</DialogTitle>
            <DialogContent>
                <h1>Send bulk message</h1>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">
                    {t('Close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SendBulkMessageDialog;
