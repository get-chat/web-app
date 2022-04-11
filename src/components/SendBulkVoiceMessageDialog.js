import React, {useState} from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import {Button, Dialog, IconButton, Tooltip} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import {useTranslation} from "react-i18next";
import VoiceRecord from "./Main/Chat/ChatFooter/VoiceRecord";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_REQUEST_MIC_PERMISSION} from "../Constants";
import MicIcon from "@material-ui/icons/Mic";
import '../styles/SendBulkVoiceMessageDialog.css';

const SendBulkVoiceMessageDialog = ({open, setOpen}) => {
    // TODO: Handle isRecording globally to avoid conflicts
    const [isRecording, setRecording] = useState(false);

    const {t, i18n} = useTranslation();

    const close = () => {
        setOpen(false);
    }

    const sendHandledChosenFiles = (preparedFiles) => {
        console.log(preparedFiles);
    }

    return (
        <Dialog open={open} onClose={close} className="changePasswordDialog">
            <DialogTitle>{t('Send bulk voice message')}</DialogTitle>
            <DialogContent className="sendBulkVoiceMessageDialogContent">
                {!isRecording &&
                    <Tooltip title="Voice" placement="top">
                        <IconButton onClick={() => PubSub.publish(EVENT_TOPIC_REQUEST_MIC_PERMISSION, "bulk")}>
                            <MicIcon/>
                        </IconButton>
                    </Tooltip>
                }
                <div className={!isRecording ? 'hidden' : ''}>
                    <VoiceRecord
                        voiceRecordCase="bulk"
                        setRecording={setRecording}
                        sendHandledChosenFiles={sendHandledChosenFiles}/>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">
                    {t('Close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SendBulkVoiceMessageDialog;
