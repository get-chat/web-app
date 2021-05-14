import React, {useEffect, useState} from "react";
import {Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import '../styles/ChatTags.css';

function ChatTags(props) {

    const [chat, setChat] = useState();
    const [chatTags, setChatTags] = useState([]);
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        retrieveChat();
        listTags();
    }, []);

    const close = () => {
        props.setOpen(false);
    }

    const onDeleteTag = (tag) => {

    }

    const onClickTag = (tag) => {
        setChatTags(prevState => {
            prevState.push(tag);
            return [].concat(prevState);
        });
    }

    const retrieveChat = () => {
        axios.get( `${BASE_URL}chats/${props.waId}`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                setChat(response.data);
                setChatTags(response.data.tags);
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

                {chatTags &&
                <div className="chatTags__tags">
                    <h5>Current tags</h5>
                    <div>
                        {chatTags.map((tag) =>
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                onDelete={() => onDeleteTag(tag)} />
                        )}
                    </div>
                </div>
                }

                {allTags &&
                <div className="chatTags__tags mt-3">
                    <h5>All tags</h5>
                    <div>
                        {allTags.filter((tag) => {
                            if (chatTags) {
                                let found = false;
                                for (let i = 0; i < chatTags.length; i++) {
                                    const curTag = chatTags[i];
                                    if (curTag.id === tag.id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    return tag;
                                }
                            } else {
                                return tag;
                            }
                        }).map((tag) =>
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                clickable
                                onClick={() => onClickTag(tag)} />
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