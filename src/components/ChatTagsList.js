import React, {useEffect, useState} from "react";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import {CircularProgress, Dialog, DialogContent, DialogTitle} from "@material-ui/core";

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

    return (
        <Dialog open={props.open} onClose={close} className="chatTagsListWrapper">
            <DialogTitle>Chat tags</DialogTitle>
            <DialogContent>
                <div className="mb-3">List of all tags</div>

                {tags &&
                <div>
                    {tags.map((tag) =>
                        <div>
                            {tag.name}
                        </div>
                    )}
                </div>
                }
            </DialogContent>

            {isLoading &&
            <div className="chatTagsListWrapper__loading">
                <CircularProgress size={28} />
            </div>
            }

        </Dialog>
    )
}

export default ChatTagsList;