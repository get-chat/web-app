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
import {useParams} from "react-router-dom";
import {avatarStyles} from "../AvatarStyles";

function Main() {

    const {waId} = useParams();

    const [checked, setChecked] = React.useState(false);
    const [chatMessageToPreview, setChatMessageToPreview] = useState();
    const [unseenMessages, setUnseenMessages] = useState({});

    const avatarClasses = avatarStyles();

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

    const showNotification = (title, body, icon) => {
        function showNot() {
            // eslint-disable-next-line no-unused-vars
            const notification = new Notification(title, {
                body: body,
                icon: icon
            });
        }
        if (!window.Notification) {
            console.log('Browser does not support notifications.');
        } else {
            // Check if permission is already granted
            if (Notification.permission === 'granted') {
                showNot();
            } else {
                // request permission from user
                Notification.requestPermission().then(function (p) {
                    if (p === 'granted') {
                        showNot();
                    } else {
                        console.log('User blocked notifications.');
                    }
                }).catch(function (err) {
                    console.error(err);
                });
            }
        }
    }

    useEffect(() => {
        setChecked(true);

        // Get unseen messages
        getUnseenMessages();

        let intervalId = 0;

        if (waId) {
            intervalId = setInterval(() => {
                getUnseenMessages(true);
            }, 2500);

            console.log("Interval is set");
        }

        return () => {
            clearInterval(intervalId);
        }
    }, [waId]);

    const getUnseenMessages = (willNotify) => {
        axios.get( `${BASE_URL}unseen_messages/`,
            getConfig({
                offset: 0,
                limit: 50 // TODO: Could it be zero?
            })
        )
            .then((response) => {
                //console.log('Unseen messages', response.data);

                const preparedUnseenMessages = {};
                response.data.map((unseenMessage, index) => {
                    const prepared = new UnseenMessageClass(unseenMessage);
                    preparedUnseenMessages[prepared.waId] = prepared;
                });

                if (willNotify) {
                    let hasAnyNewMessages = false;
                    setUnseenMessages((prevState => {
                            Object.entries(preparedUnseenMessages).map((unseen, index) => {
                                const unseenWaId = unseen[0]
                                const number = unseen[1].unseenMessages;
                                if (unseenWaId !== waId) {
                                    // TODO: Consider a new contact (last part of the condition)
                                    if ((prevState[unseenWaId] && number > prevState[unseenWaId].unseenMessages) /*|| (!prevState[unseenWaId] && number > 0)*/) {
                                        hasAnyNewMessages = true;
                                    }
                                }
                            });

                            return preparedUnseenMessages;
                        }
                    ));

                    // Display a notification
                    if (hasAnyNewMessages) {
                        showNotification("New messages", "You have new messages!");
                    }
                } else {
                    setUnseenMessages(preparedUnseenMessages);
                }

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

                        <Avatar className={avatarClasses[chatMessageToPreview.preparedInitials]}>{chatMessageToPreview.preparedInitials}</Avatar>
                        <div className="app_imagePreview__header__senderInfo">
                            <h3>{chatMessageToPreview.preparedName}</h3>
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