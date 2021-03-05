import React from "react";
import {Button} from "@material-ui/core";
import {Alert} from "@material-ui/lab";

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

    /*const [modalOpen, setModalOpen] = useState(false);

    const handleOpen = () => {
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
    };

    const classes = useStyles();*/

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

                    {Object.entries(templates).map((message, index) =>
                        <div key={message[0]} className="templateMessageWrapper">

                            <div className="chat__templateMsg chat__message chat__receiver">
                                {/*<span className={"templateMessage__status " + message[1].status}>{message[1].status}</span>*/}
                                <div className="templateMessage__message">
                                    {/*{message[1].text}*/}

                                    {/*{JSON.stringify(message[1].components)}*/}

                                    {message[1].components.map((comp, index) =>
                                        <div key={index}>
                                            <span className="templateType bold lowercase">{comp.type}:</span> {comp.text ?? comp.format ?? JSON.stringify(comp.buttons)}
                                        </div>
                                    )}

                                </div>
                            </div>

                            {message[1].status === "approved" &&
                            <Button onClick={() => props.onSend(message[1])}>Send</Button>
                            }

                        </div>
                    )}

                </div>
            }
        </div>
    )
}

export default TemplateMessages;