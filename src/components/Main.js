import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import {Avatar, Fade, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {BASE_URL, EVENT_TOPIC_CHAT_MESSAGE} from "../Constants";
import axios from "axios";
import {getConfig} from "../Helpers";
import UnseenMessageClass from "../UnseenMessageClass";

function Main() {

    const [checked, setChecked] = React.useState(false);
    const [chatMessageToPreview, setChatMessageToPreview] = useState();
    const [unseenMessages, setUnseenMessages] = useState({});

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

        // Get unseen messages
        getUnseenMessages();

        let intervalId = 0;
        intervalId = setInterval(() => {
            getUnseenMessages();
        }, 2500);

        console.log("Interval is set");

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    const getUnseenMessages = () => {
        axios.get( `${BASE_URL}unseen_messages/`,
            getConfig({
                offset: 0,
                limit: 30
            })
        )
            .then((response) => {
                //console.log('Unseen messages', response.data);

                const preparedUnseenMessages = {};
                response.data.map((unseenMessage, index) => {
                    const prepared = new UnseenMessageClass(unseenMessage);
                    preparedUnseenMessages[prepared.waId] = prepared;
                });

                setUnseenMessages(preparedUnseenMessages);

            })
            .catch((error) => {
                // TODO: Handle errors
            });
    }

    return (
        <Fade in={checked}>
            <div className="app__body">
                <Sidebar
                    unseenMessages={unseenMessages}
                />
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
                        {(chatMessageToPreview.imageId || chatMessageToPreview.imageLink) &&
                        <img className="app__imagePreview__image" src={chatMessageToPreview.generateImageLink()} alt="Preview"/>
                        }
                        {(chatMessageToPreview.videoId || chatMessageToPreview.videoLink) &&
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