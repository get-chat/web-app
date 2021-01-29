import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import {Fade, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_CHAT_MESSAGE} from "../Constants";

function Main() {

    const [checked, setChecked] = React.useState(false);
    const [isMediaPreviewVisible, setMediaPreviewVisible] = useState(false);
    const [imagePreviewURL, setImagePreviewURL] = useState();
    const [videoPreviewURL, setVideoPreviewURL] = useState();

    const hideImageOrVideoPreview = () => {
        setImagePreviewURL(null);
        setVideoPreviewURL(null);
        setMediaPreviewVisible(false);
    }

    const previewMedia = (mediaURL, isVideo) => {
        if (!mediaURL) {
            hideImageOrVideoPreview();
            return false;
        }

        // Pause any playing audios
        PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');

        if (isVideo) {
            setVideoPreviewURL(mediaURL);
        } else {
            setImagePreviewURL(mediaURL);
        }

        setMediaPreviewVisible(true);
    }

    useEffect(() => {
        setChecked(true);
    }, []);

    return(
        <Fade in={checked}>
            <div className="app__body">
                <Sidebar />
                <Chat previewMedia={(URL, isVideo) => previewMedia(URL, isVideo)} />

                {isMediaPreviewVisible === true &&
                <div className="app__imagePreview">
                    <div className="app__imagePreview__header">
                        <IconButton className="app__imagePreview__close" onClick={() => hideImageOrVideoPreview()}>
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </div>
                    <div className="app__imagePreview__container" onClick={() => hideImageOrVideoPreview()}>
                        {imagePreviewURL &&
                        <img className="app__imagePreview__image" src={imagePreviewURL} alt="Preview"/>
                        }
                        {videoPreviewURL &&
                        <video className="app__imagePreview__video" src={videoPreviewURL} controls autoPlay={true} />
                        }
                    </div>
                </div>
                }
            </div>
        </Fade>
    )
}

export default Main;