import React, {useEffect, useState} from "react";
import {
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link
} from "@material-ui/core";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig, getHubURL} from "../Helpers/Helpers";
import '../styles/ChatTags.css';

function ChatTags(props) {

    const [isLoading, setLoading] = useState(true);
    const [chat, setChat] = useState();
    const [chatTags, setChatTags] = useState([]);
    const [unusedTags, setUnusedTags] = useState([]);
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        retrieveChat();
    }, []);

    useEffect(() => {
        const nextState = allTags.filter((tag) => {
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
                    return true;
                }
            } else {
                return true;
            }
        });

        setUnusedTags(nextState);

    }, [chatTags, allTags]);

    const close = () => {
        props.setOpen(false);
    }

    const onDeleteTag = (tag) => {
        deleteTag(tag);
    }

    const onClickTag = (tag) => {
        createTag(tag);
    }

    const makeUniqueTagsArray = (tagsArray) => {
        const uniqueTagsArray = {};
        tagsArray.forEach((tag) => {
            if (!uniqueTagsArray.hasOwnProperty(tag.id)) {
                uniqueTagsArray[tag.id] = tag;
            }
        });

        return Object.values(uniqueTagsArray);
    }

    const retrieveChat = () => {
        axios.get( `${BASE_URL}chats/${props.waId}/`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                setChat(response.data);
                setChatTags(response.data.tags);

                // Next
                listTags();
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

                setLoading(false);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const createTag = (tag) => {
        axios.post( `${BASE_URL}chat_tagging/`, {
            tag: tag.id,
            chat: props.waId
        }, getConfig())
            .then((response) => {
                console.log("Created tag: ", response.data);

                setChatTags(prevState => {
                    let nextState = prevState.filter((curTag) => {
                        return curTag.id !== tag.id;
                    });

                    tag.tagging_id = response.data.id;

                    nextState.push(tag);
                    nextState = makeUniqueTagsArray(nextState);

                    return nextState;
                });
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const deleteTag = (tag) => {
        axios.delete( `${BASE_URL}chat_tagging/${tag.tagging_id}`, getConfig())
            .then((response) => {
                console.log("Deleted tag: ", response.data);

                setChatTags(prevState => {
                    let nextState = prevState.filter((curTag) => {
                        return curTag.id !== tag.id;
                    });
                    nextState = makeUniqueTagsArray(nextState);
                    return nextState;
                });
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    return (
        <Dialog open={props.open} onClose={close} className="chatTagsWrapper">
            <DialogTitle>Chat tags</DialogTitle>
            <DialogContent>
                <DialogContentText>You can add or remove tags for this chat.</DialogContentText>

                {chatTags &&
                <div className="chatTags__tags current">
                    <h5>Current tags</h5>
                    {chatTags?.length > 0
                        ?
                        <div>
                            {chatTags.map((tag) =>
                                <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    onDelete={() => onDeleteTag(tag)} />
                            )}
                        </div>
                        :
                        <div className="chatTags__tags__empty mt-1">
                            Empty
                        </div>
                    }
                </div>
                }

                {allTags &&
                <div className="chatTags__tags mt-3">
                    <h5>All tags</h5>
                    {unusedTags?.length > 0
                        ?
                        <div>
                            {unusedTags.map((tag) =>
                                <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    clickable
                                    onClick={() => onClickTag(tag)} />
                            )}
                        </div>
                        :
                        <div className="chatTags__tags__empty mt-1">
                            Empty
                        </div>
                    }
                </div>
                }

                <div className="mt-3">
                    <Link href={getHubURL() + 'main/tag/'} target="_blank">Manage tags</Link>
                </div>

            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                {/*<Button color="primary">Update</Button>*/}
            </DialogActions>

            {isLoading &&
            <div className="chatTagsWrapper__loading">
                <CircularProgress size={28} />
            </div>
            }

        </Dialog>
    )
}

export default ChatTags;