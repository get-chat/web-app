import React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {useTranslation} from "react-i18next";

function DownloadUnsupportedFile(props) {

    const { t, i18n } = useTranslation();

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
                {t('Unsupported file type')}
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    {t('This file type is not supported, however you can still download it.')}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={close} color="secondary">
                    {t('Close')}
                </Button>
                <Button onClick={download} color="primary">
                    {t('Download')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DownloadUnsupportedFile;