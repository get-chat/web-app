import React, {useEffect, useState} from "react";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, ListItem} from "@material-ui/core";
import '../styles/ChatTagsList.css';
import LabelIcon from "@material-ui/icons/Label";

function ChatTagsList(props) {

    const [isLoading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        listTags();
    }, []);

    const close = () => {
        props.setOpen(false);
    }

    const listTags = () => {
        axios.get( `${BASE_URL}tags/`, getConfig())
            .then((response) => {
                console.log("Tags: ", response.data);

                setTags(response.data.results);

                setLoading(false);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const handleClick = (tag) => {
        props.setFilterTag(tag.id);
        close();
    }

    return (
        <Dialog open={props.open} onClose={close} className="chatTagsListWrapper">
            <DialogTitle>Tags</DialogTitle>
            <DialogContent className="chatTagsListWrapper">
                <div className="mb-3">List of all tags</div>

                {tags &&
                <div>
                    {tags.map((tag) =>
                        <ListItem key={tag.id} button onClick={() => handleClick(tag)}>
                            <div className="chatTagsListWrapper__tag">
                                <LabelIcon style={{fill: tag.web_inbox_color}} />
                                {tag.name}
                            </div>
                        </ListItem>
                    )}
                </div>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
            </DialogActions>

            {isLoading &&
            <div className="chatTagsListWrapper__loading">
                <CircularProgress size={28} />
            </div>
            }

        </Dialog>
    )
}

export default ChatTagsList;