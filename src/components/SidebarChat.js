import React, {useEffect, useState} from 'react';
import '../styles/SidebarChat.css';
import {Avatar} from "@material-ui/core";
import {Link, useHistory, useParams} from "react-router-dom";
import Moment from "react-moment";
import {avatarStyles} from "../AvatarStyles";
import moment from "moment";
import {markOccurrences, replaceEmojis} from "../Helpers";
import {getDroppedFiles, handleDragOver} from "../FileHelpers";
import PubSub from "pubsub-js";
import {CALENDAR_SHORT, EVENT_TOPIC_DROPPED_FILES} from "../Constants";
import ChatMessageClass from "../ChatMessageClass";
import ChatMessageTypeIcon from "./ChatMessageTypeIcon";

function SidebarChat(props) {

    const history = useHistory();

    const [timeLeft, setTimeLeft] = useState();
    const {waId} = useParams();
    const avatarClasses = avatarStyles();

    useEffect(() => {

        function calculateRemaining() {
            const momentDate = moment.unix(props.chatData.lastMessageTimestamp);
            momentDate.add(1, 'day');
            const curDate = moment(new Date());
            const hours = momentDate.diff(curDate, 'hours');

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
                    suffix = ' minutes';
                } else {
                    suffix = ' minute';
                }
                setTimeLeft(minutes + suffix);
            }
        }

        // Initial
        calculateRemaining();

        let intervalId;
        if (!props.chatData.isExpired) {
            intervalId = setInterval(() => {
                calculateRemaining();
            }, 30000);
        }

        return () => {
            clearInterval(intervalId);
        }

    }, [props.chatData.lastMessageTimestamp]);

    const handleDroppedFiles = (event) => {
        if (props.chatData.isExpired) {

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
            <div
                id={props.chatData.waId}
                className={'sidebarChat ' + (waId === props.chatData.waId ? 'activeChat' : '')}
                onDrop={(event) => handleDroppedFiles(event)}
                onDragOver={(event) => handleDragOver(event)}>

                <Avatar className={props.chatData.isExpired ? '' : avatarClasses[props.chatData.getAvatarClassName()]}>{props.chatData.initials}</Avatar>
                <div className="sidebarChat__info">

                    <div className="sidebarChat__info__nameWrapper">
                        <h2>
                            {(props.keyword !== undefined && props.keyword.trim().length > 0)
                                ?
                                <span dangerouslySetInnerHTML={{__html: markOccurrences(props.chatData.name, props.keyword)}}/>
                                :
                                <span>{props.chatData.name}</span>
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
                        {((props.unseenMessages[props.chatData.waId]?.unseenMessages ?? 0) > 0 /*&& waId !== props.chatData.waId*/)
                            ?
                            <span className="sidebarChat__info__lastMessage__new">
                                {props.unseenMessages[props.chatData.waId]?.unseenMessages} new message(s)
                            </span>
                            :
                            <span className="sidebarChat__info__lastMessage__body">
                                {props.chatData.lastMessage?.type === ChatMessageClass.TYPE_TEXT
                                    ?
                                    <span dangerouslySetInnerHTML={{__html: replaceEmojis(props.chatData.lastMessageBody, true) }} />
                                    :
                                    <ChatMessageTypeIcon type={props.chatData.lastMessage?.type} />
                                }
                            </span>
                        }
                    </span>

                    {props.chatData.isExpired
                        ?
                        <span className="sidebarChat__info__expired">Expired</span>
                        :
                        <span className="sidebarChat__info__timeLeft">{timeLeft} left</span>
                    }

                </div>
            </div>
        </Link>
    )
}

export default SidebarChat