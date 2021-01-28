import React, {useEffect, useRef, useState} from 'react'
import '../styles/Chat.css'
import {Avatar, Fade, IconButton} from "@material-ui/core";
import {AttachFile, InsertEmoticon, MoreVert, Search, Send} from "@material-ui/icons";
import ChatMessage from "./ChatMessage";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getConfig} from "../Helpers";
import {BASE_URL} from "../Constants";
import CloseIcon from "@material-ui/icons/Close";

export default function Chat(props) {

    const messagesContainer = useRef(null);
    const fileInput = useRef(null);
    const [isLoaded, setLoaded] = useState(false);
    const [contact, setContact] = useState();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState();
    const {waId} = useParams();

    useEffect(() => {
        if (messagesContainer) {
            messagesContainer.current.addEventListener('DOMNodeInserted', event => {
                const { currentTarget: target } = event;
                target.scroll({ top: target.scrollHeight /*, behavior: 'smooth'*/ });
            });
        }
    }, []);

    useEffect(() => {

        setLoaded(false);

        // Clear values for next route
        setContact(null);
        setMessages([]);
        props.previewImage(null);

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

                intervalId = setInterval(() => {
                    getMessages();
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

    const getMessages = () => {
        axios.get( `${BASE_URL}messages/${waId}/`, getConfig({
            offset: 0,
            limit: 100
        }))
            .then((response) => {
                console.log("Messages", response.data);
                setMessages(response.data.results.reverse());
                setLoaded(true);
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

                    /*let currentMessages = messages;
                    currentMessages.push({
                        customer_wa_id: "0",
                        from_us: true,
                        seen: false,
                        waba_payload: {
                            to: waId,
                            timestamp: "1610094612.9268332",
                            id: "0",
                            text: {
                                body: input.trim()
                            }
                        }
                    })
                    setMessages(currentMessages);*/

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
        return message.sender?.username ?? (!message.from_us ? contact?.waba_payload?.profile?.name : "Me");
        //return senderWaId === contact?.wa_id ? contact?.waba_payload?.profile?.name : "Me";
    };

    const playVoice = (voiceId) => {
        const audio = new Audio(`${BASE_URL}media/${voiceId}`);
        audio.play();
    };

    return (
        <div className="chat">

            <div className="chat__header">
                <Avatar>{contact?.initials}</Avatar>

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

            <div className="chat__body" ref={messagesContainer}>
                <div className="chat__empty"/>
                {messages.map((message, index) => (
                    <ChatMessage
                        key={index}
                        waId={message.customer_wa_id}
                        name={getSenderName(message)}
                        message={message.waba_payload?.text?.body}
                        mediaURL={message.waba_payload?.image?.link}
                        voice={message.waba_payload?.voice?.id}
                        onPlayVoice={(voiceId) => playVoice(voiceId)}
                        timestamp={message.waba_payload.timestamp}
                        isSeen={message.seen}
                        isFromUs={message.from_us}
                        onPreview={(URL) => props.previewImage(URL)} />
                ))}
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