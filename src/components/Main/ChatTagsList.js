import React, {useState} from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Link,
    ListItem
} from "@material-ui/core";
import '../../styles/ChatTagsList.css';
import LabelIcon from "@material-ui/icons/Label";
import {getHubURL} from "../../helpers/URLHelper";

function ChatTagsList(props) {

    const [isLoading, setLoading] = useState(false);

    const close = () => {
        props.setOpen(false);
    }

    const handleClick = (tag) => {
        props.setFilterTag(tag);
        close();
    }

    return (
        <Dialog open={props.open} onClose={close} className="chatTagsListWrapper">
            <DialogTitle>Tags</DialogTitle>
            <DialogContent className="chatTagsListWrapper">
                <div className="mb-3">You can filter chats by tags.</div>

                {props.tags &&
                <div className="chatTagsList">
                    {props.tags.length > 0
                        ?
                        <div>
                            {props.tags.map((tag) =>
                                <ListItem key={tag.id} button onClick={() => handleClick(tag)}>
                                    <div className="chatTagsListWrapper__tag">
                                        <LabelIcon style={{fill: tag.web_inbox_color}} />
                                        {tag.name}
                                    </div>
                                </ListItem>
                            )}
                        </div>
                        :
                        <div className="chatTagsList__empty">
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