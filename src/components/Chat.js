import React, {useEffect, useRef, useState} from 'react'
import '../styles/Chat.css'
import {Avatar, CircularProgress, IconButton} from "@material-ui/core";
import {AttachFile, InsertEmoticon, MoreVert, Search, Send} from "@material-ui/icons";
import ChatMessage from "./ChatMessage";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getConfig} from "../Helpers";
import {BASE_URL} from "../Constants";
import {avatarStyles} from "../AvatarStyles";
import ChatMessageClass from "../ChatMessageClass";

export default function Chat(props) {

    const messagesContainer = useRef(null);
    const fileInput = useRef(null);
    const [isLoaded, setLoaded] = useState(false);
    const [isLoadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [contact, setContact] = useState();
    const [messages, setMessages] = useState({});
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState();
    const {waId} = useParams();

    useEffect(() => {
        function handleScroll(e) {
            if (e.target.scrollTop === 0 && isLoaded && !isLoadingMoreMessages) {
                setLoadingMoreMessages(true);
                getMessages(getMessagesCount());
            }
        }

        if (messagesContainer) {
            messagesContainer.current.addEventListener("scroll", handleScroll);
        }

        return () => {
            messagesContainer.current.removeEventListener("scroll", handleScroll);
        }
    }, [messages, isLoaded, isLoadingMoreMessages]);

    useEffect(() => {
        if (messagesContainer) {
            messagesContainer.current.addEventListener('DOMNodeInserted', event => {
                if(event.target.parentNode.id === "chat__body") {
                    const {currentTarget: target} = event;
                    target.scroll({top: target.scrollHeight /*, behavior: 'smooth'*/});
                }
            });
        }
    }, []);

    useEffect(() => {
        setLoaded(false);

        // Clear values for next route
        setContact(null);
        setMessages([]);
        props.previewMedia(null);

        if (!waId) {
            console.log('waId is empty.');
            return false;
        }

        console.log("Interval is set");
        let intervalId = 0;

        axios.get(`${BASE_URL}contacts/${waId}/`, getConfig())
            .then((response) => {
                console.log("Contact", response.data);
                setContact(response.data);

                // Contact information is loaded, now load messages
                getMessages();

                // TODO: It conflicts with infinite scrolling feature
                intervalId = setInterval(() => {
                    getNewMessagesTemp();
                }, 2500);

            })
            .catch((error) => {
                // TODO: Handle errors
            });

        return () => {
            clearInterval(intervalId);
        }
    }, [waId]);

    useEffect(() => {
        if (selectedFile) {
            console.log(selectedFile);

            uploadFile();
        }
    }, [selectedFile]);

    const getMessagesCount = () => {
        return Object.keys(messages).length;
    }

    const getMessages = (offset) => {
        axios.get( `${BASE_URL}messages/${waId}/`, getConfig({
            offset: offset ?? 0,
            limit: 20
        }))
            .then((response) => {
                console.log("Messages", response.data);
                //setMessages(response.data.results.reverse());

                const preparedMessages = {};
                response.data.results.reverse().map((message, index) => {
                    const prepared = new ChatMessageClass(message);
                    preparedMessages[prepared.id] = prepared;
                });

                // To persist scroll position, we store current scroll information
                const prevScrollTop = messagesContainer.current.scrollTop;
                const prevScrollHeight = messagesContainer.current.scrollHeight;

                setMessages((prevState =>
                        Object.assign(preparedMessages, prevState)
                ));

                // Persisting scroll position by calculating container height difference
                const nextScrollHeight = messagesContainer.current.scrollHeight;
                messagesContainer.current.scrollTop = (nextScrollHeight - prevScrollHeight) + prevScrollTop;

                setLoaded(true);
                setLoadingMoreMessages(false);
            })
            .catch((error) => {
                setLoadingMoreMessages(false);

                // TODO: Handle errors
            });
    }

    // Temporary solution, will be replaced with socket
    const getNewMessagesTemp = () => {
        axios.get( `${BASE_URL}messages/${waId}/`, getConfig({
            offset: 0,
            limit: 20
        }))
            .then((response) => {
                console.log("Interval: Messages", response.data);

                const preparedNewMessages = {};
                response.data.results.reverse().map((message, index) => {
                    if (messages[message.waba_payload?.id] === undefined) {
                        const prepared = new ChatMessageClass(message);
                        preparedNewMessages[prepared.id] = prepared;
                    }
                });

                setMessages((prevState =>
                        Object.assign(prevState, preparedNewMessages)
                ));
            })
            .catch((error) => {
                // TODO: Handle errors
            });
    }

    const sendMessage = (e) => {
        e.preventDefault();

        if (input.trim() === "") {
            return false;
        }

        console.log('You typed: ', input);

        if (isLoaded) {
            axios.post( `${BASE_URL}messages/${waId}/`, {
                text: {
                    body: input.trim()
                }
            }, getConfig())
                .then((response) => {
                    console.log(response.data);

                    getMessages();

                })
                .catch((error) => {
                    // TODO: Handle errors
                });

            setInput("");
        }
    }

    const sendFile = (fileURL) => {
        if (isLoaded) {
            axios.post( `${BASE_URL}messages/${waId}/`, {
                recipient_type: 'individual',
                to: waId,
                type: 'image',
                image: {
                    link: fileURL
                }
            }, getConfig())
                .then((response) => {
                    console.log(response.data);

                    getMessages();
                })
                .catch((error) => {
                    // TODO: Handle errors
                });
        }
    }

    const handleAttachmentClick = () => {
        fileInput.current.click();
    }

    const uploadFile = () => {
        if (isLoaded) {
            const formData = new FormData();
            //formData.append("file_name", file.name);
            formData.append("file_encoded", selectedFile);

            axios.post(`${BASE_URL}media/`, formData, getConfig())
                .then((response) => {
                    console.log(response.data)

                    sendFile(response.data.file);
                })
                .catch((error) => {
                    // TODO: Handle errors
                });
        }
    }

    const getSenderName = (message) => {
        return message.senderObject?.username ?? (!message.isFromUs ? contact?.waba_payload?.profile?.name : "Us");
    };

    const avatarClasses = avatarStyles();

    return (
        <div className="chat">

            <div className="chat__header">
                <Avatar className={avatarClasses.green}>{contact?.initials}</Avatar>

                <div className="chat__headerInfo">
                    <h3>{contact?.waba_payload?.profile?.name}</h3>
                    {/*<p>Last seen at ...</p>*/}
                </div>

                <div className="chat__headerRight">
                    <IconButton>
                        <Search />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </div>
            </div>

            <div id="chat__body" className="chat__body" ref={messagesContainer}>
                <div className="chat__body__loadingMore" hidden={!isLoadingMoreMessages}>
                    <CircularProgress />
                </div>
                <div className="chat__empty"/>

                { Object.entries(messages).map((message, index) =>
                    <ChatMessage
                        key={message[0]}
                        name={getSenderName(message[1])}
                        messageData={message[1]}
                        onPreview={(chatMessage) => props.previewMedia(chatMessage)} />
                )}
            </div>

            <div className="chat__footer">
                <IconButton>
                    <InsertEmoticon />
                </IconButton>
                <IconButton onClick={handleAttachmentClick}>
                    <AttachFile />
                </IconButton>

                <form className="chat__mediaForm">
                    <input
                        type="file"
                        //value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        ref={fileInput} />
                </form>

                <form>
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message" type="text" />
                    <button onClick={sendMessage} type="submit">Send a message</button>
                </form>

                <IconButton onClick={sendMessage}>
                    <Send />
                </IconButton>
            </div>

            {!waId &&
            <div className="chat__default">
                <h2>Hey</h2>
                <p>Choose a contact to start a conversation</p>
            </div>
            }

        </div>
    )
}