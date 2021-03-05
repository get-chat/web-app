import React, {useState} from "react";
import {Button} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import SendTemplateMessage from "./SendTemplateMessage";

/*const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));*/

function TemplateMessages(props) {

    const templates = props.templatesData;

    const [chosenTemplate, setChosenTemplate] = useState();
    const [isDialogVisible, setDialogVisible] = useState(false);

    const showDialog = () => {
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
    };

    /*const [modalOpen, setModalOpen] = useState(false);

    const handleOpen = () => {
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
    };

    const classes = useStyles();*/

    const chooseTemplate = (template) => {
        setChosenTemplate(template);
        showDialog();
    }

    return (
        <div className="templateMessagesOuter">

            {/*<Modal
                open={modalOpen}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className={classes.modal}
            >
                <CreateTemplate />
            </Modal>

            <div className="templateMessagesOuter__items">
                <Button onClick={handleOpen}>Create a template</Button>
            </div>*/}

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
                                    {/*{template[1].text}*/}

                                    {/*{JSON.stringify(template[1].components)}*/}

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
                    {/*<DialogContentText>
                        Send this template:
                    </DialogContentText>*/}

                    <SendTemplateMessage data={chosenTemplate} />

                </DialogContent>
                <DialogActions>
                    <Button onClick={hideDialog} color="secondary">Cancel</Button>
                    <Button onClick={hideDialog} color="primary" autoFocus>Send</Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default TemplateMessages;