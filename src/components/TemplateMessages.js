import React, {useEffect, useState} from "react";
import {Button} from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import SendTemplateMessage from "./SendTemplateMessage";
import {EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR} from "../Constants";
import PubSub from "pubsub-js";

function TemplateMessages(props) {

    const templates = props.templatesData;

    const [chosenTemplate, setChosenTemplate] = useState();
    const [isDialogVisible, setDialogVisible] = useState(false);

    const [errors, setErrors] = useState();

    const showDialog = () => {
        setErrors(undefined);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setErrors(undefined);
        setDialogVisible(false);
    };

    const chooseTemplate = (template) => {
        setChosenTemplate(template);
        showDialog();
    }

    const send = () => {
        props.onSend(chosenTemplate);
        //hideDialog();
    }

    useEffect(() => {
        const onSendTemplateMessageError = function (msg, data) {
            setErrors(data);
        }

        const sendTemplateMessageErrorEventToken = PubSub.subscribe(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, onSendTemplateMessageError);

        return () => {
            PubSub.unsubscribe(sendTemplateMessageErrorEventToken);
        }
    }, []);

    return (
        <div className="templateMessagesOuter">
            {/*<SearchBar />*/}

            {props.isLoadingTemplates
                ?
                <Alert severity="info">Loading template messages...</Alert>
                :
                <div className="templateMessages">

                    {Object.entries(templates).map((template, index) =>
                        <div key={template[0]} className="templateMessageWrapper">

                            <div className="chat__templateMsg chat__message chat__receiver">
                                {/*<span className={"templateMessage__status " + template[1].status}>{template[1].status}</span>*/}
                                <div className="templateMessage__message">
                                    {template[1].components.map((comp, index) =>
                                        <div key={index}>
                                            <span className="templateType bold lowercase">{comp.type}:</span> {comp.text ?? comp.format ?? JSON.stringify(comp.buttons)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {template[1].status === "approved" &&
                            <Button onClick={() => chooseTemplate(template[1]) /*props.onSend(template[1])*/}>Send</Button>
                            }

                        </div>
                    )}

                </div>
            }

            <Dialog
                open={isDialogVisible}
                onClose={hideDialog}>
                <DialogTitle>{"Send a template message"}</DialogTitle>
                <DialogContent>
                    <SendTemplateMessage data={chosenTemplate} />

                    {errors &&
                    <div>
                        {errors.map((err, index) =>
                            <Alert severity="error">
                                <AlertTitle>{err.title}</AlertTitle>
                                {err.details}
                            </Alert>
                        )}
                    </div>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={hideDialog} color="secondary">Cancel</Button>
                    <Button onClick={send} color="primary" autoFocus>Send</Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default TemplateMessages;