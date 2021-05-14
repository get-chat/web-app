import React, {useEffect, useState} from "react";
import {Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import '../styles/ChatTags.css';

function ChatTags(props) {

    const [chat, setChat] = useState([]);
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        retrieveChat();
        listTags();
    }, []);

    const close = () => {
        props.setOpen(false);
    }

    const onDeleteTag = (id) => {

    }

    const onClickTag = (id) => {

    }

    const retrieveChat = () => {
        axios.get( `${BASE_URL}chats/${props.waId}`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                setChat(response.data);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const listTags = () => {
        axios.get( `${BASE_URL}tags/`, getConfig())
            .then((response) => {
                console.log("Tags: ", response.data);

                setAllTags(response.data.results);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>Chat tags</DialogTitle>
            <DialogContent>
                <div className="mb-3">You can add or remove tags for this chat</div>

                {chat?.tags &&
                <div className="chatTags__tags">
                    <h5 className="mb-2">Current tags</h5>
                    <div>
                        {chat.tags.map((tag) =>
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                onDelete={() => onDeleteTag(tag.id)} />
                        )}
                    </div>
                </div>
                }

                {allTags &&
                <div className="chatTags__tags">
                    <h5 className="mb-2">All tags</h5>
                    <div>
                        {allTags.map((tag) =>
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                clickable
                                onClick={() => onClickTag(tag.id)} />
                        )}
                    </div>
                </div>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChatTags;