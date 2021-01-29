import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import {Avatar, Fade, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_CHAT_MESSAGE} from "../Constants";

function Main() {

    const [checked, setChecked] = React.useState(false);
    const [chatMessageToPreview, setChatMessageToPreview] = useState();

    const hideImageOrVideoPreview = () => {
        setChatMessageToPreview(null);
    }

    const previewMedia = (chatMessage) => {
        if (!chatMessage) {
            hideImageOrVideoPreview();
            return false;
        }

        // Pause any playing audios
        PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');

        setChatMessageToPreview(chatMessage);
    }

    useEffect(() => {
        setChecked(true);
    }, []);

    return(
        <Fade in={checked}>
            <div className="app__body">
                <Sidebar />
                <Chat previewMedia={(chatMessage) => previewMedia(chatMessage)} />

                {chatMessageToPreview &&
                <div className="app__imagePreview">
                    <div className="app__imagePreview__header">

                        <Avatar>?</Avatar>
                        <div className="app_imagePreview__header__senderInfo">
                            <h3>{chatMessageToPreview.waId}</h3>
                        </div>

                        <IconButton className="app__imagePreview__close" onClick={() => hideImageOrVideoPreview()}>
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </div>
                    <div className="app__imagePreview__container" onClick={() => hideImageOrVideoPreview()}>
                        {chatMessageToPreview.imageLink &&
                        <img className="app__imagePreview__image" src={chatMessageToPreview.imageLink} alt="Preview"/>
                        }
                        {chatMessageToPreview.videoId &&
                        <video className="app__imagePreview__video" src={chatMessageToPreview.generateVideoLink()} controls autoPlay={true} />
                        }
                    </div>
                </div>
                }
            </div>
        </Fade>
    )
}

export default Main;