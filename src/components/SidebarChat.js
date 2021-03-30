import React, {useEffect, useState} from 'react';
import '../styles/SidebarChat.css';
import {Avatar, ListItem} from "@material-ui/core";
import {Link, useHistory, useParams} from "react-router-dom";
import Moment from "react-moment";
import {avatarStyles} from "../AvatarStyles";
import moment from "moment";
import {markOccurrences} from "../Helpers";
import {getDroppedFiles, handleDragOver} from "../FileHelpers";
import PubSub from "pubsub-js";
import {CALENDAR_SHORT, EVENT_TOPIC_DROPPED_FILES} from "../Constants";
import ChatMessageShortContent from "./ChatMessageShortContent";

function SidebarChat(props) {

    const history = useHistory();

    const [isExpired, setExpired] = useState(props.chatData.isExpired);
    const [timeLeft, setTimeLeft] = useState();
    const [remainingSeconds, setRemainingSeconds] = useState();
    const {waId} = useParams();
    const avatarClasses = avatarStyles();

    useEffect(() => {
        props.retrieveContactData(props.chatData.waId);
    }, []);

    useEffect(() => {
        function calculateRemaining() {
            const momentDate = moment.unix(props.chatData.lastMessageTimestamp);
            momentDate.add(1, 'day');
            const curDate = moment(new Date());
            const hours = momentDate.diff(curDate, 'hours');
            const seconds = momentDate.diff(curDate, 'seconds');

            setRemainingSeconds(seconds);

            let suffix;

            if (hours > 0) {
                if (hours === 1) {
                    suffix = ' hour';
                } else {
                    suffix = ' hours';
                }
                setTimeLeft(hours + suffix);
            } else {
                const minutes = momentDate.diff(curDate, 'minutes');
                if (minutes > 1) {
                    if (minutes > 1) {
                        suffix = ' minutes';
                    } else {
                        suffix = ' minute';
                    }
                    setTimeLeft(minutes + suffix);
                } else {
                    if (seconds > 1) {
                        suffix = ' minute';
                        setTimeLeft(minutes + suffix);
                    } else {
                        // Expired
                        setExpired(true);
                    }
                }
            }
        }

        setExpired(props.chatData.isExpired);

        // Initial
        calculateRemaining();

        let intervalId;
        if (!isExpired) {
            intervalId = setInterval(() => {
                calculateRemaining();
            }, 30000);
        }

        return () => {
            clearInterval(intervalId);
        }
    }, [isExpired, props.chatData.isExpired, props.chatData.lastMessageTimestamp]);

    const handleDroppedFiles = (event) => {
        if (isExpired) {
            event.preventDefault();
            return;
        }

        // Preparing dropped files
        const files = getDroppedFiles(event);

        // Switching to related chat
        history.push(`/main/chat/${props.chatData.waId}`);

        // Sending files via eventbus
        PubSub.publish(EVENT_TOPIC_DROPPED_FILES, files);
    }

    return (
        <Link to={ `/main/chat/${props.chatData.waId}` }>
            <ListItem button>
                <div
                    id={props.chatData.waId}
                    className={'sidebarChat ' + (waId === props.chatData.waId ? 'activeChat ' : '') + (isExpired ? 'expired ' : (remainingSeconds < 3600 ? 'almostExpired ' : ''))}
                    onDrop={(event) => handleDroppedFiles(event)}
                    onDragOver={(event) => handleDragOver(event)}>

                    <Avatar src={props.contactProvidersData[props.chatData.waId]?.[0]?.avatar} className={isExpired ? '' : avatarClasses[props.chatData.getAvatarClassName()]}>{props.chatData.initials}</Avatar>
                    <div className="sidebarChat__info">

                        <div className="sidebarChat__info__nameWrapper">
                            <h2>
                                {(props.keyword !== undefined && props.keyword.trim().length > 0)
                                    ?
                                    <span dangerouslySetInnerHTML={{__html: markOccurrences(props.chatData.name, props.keyword)}}/>
                                    :
                                    <span>{props.contactProvidersData[props.chatData.waId]?.[0]?.name ?? props.chatData.name}</span>
                                }

                                <span className="sidebarChat__info__waId">{'+' + props.chatData.waId}</span>
                            </h2>

                            <Moment
                                className="sidebarChat__info__nameWrapper__lastMessageDate"
                                date={props.chatData.lastMessageTimestamp}
                                calendar={CALENDAR_SHORT}
                                unix />
                        </div>

                        <span className="sidebarChat__info__lastMessage">
                        {((props.newMessages[props.chatData.waId]?.newMessages ?? 0) > 0 /*&& waId !== props.chatData.waId*/)
                            ?
                            <span className="sidebarChat__info__lastMessage__new">
                                {props.newMessages[props.chatData.waId]?.newMessages} new message(s)
                            </span>
                            :
                            <span className="sidebarChat__info__lastMessage__body">
                                <ChatMessageShortContent
                                    type={props.chatData.lastMessageType}
                                    buttonText={props.chatData.lastMessageButtonText}
                                    text={props.chatData.lastMessageBody}
                                    caption={props.chatData.lastMessageCaption} />
                            </span>
                        }
                    </span>

                        {!isExpired &&
                            <span className="sidebarChat__info__timeLeft">{timeLeft} left</span>
                        }

                    </div>
                </div>
            </ListItem>
        </Link>
    )
}

export default SidebarChat