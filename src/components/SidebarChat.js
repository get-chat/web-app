import React, {useEffect, useState} from 'react';
import '../styles/SidebarChat.css';
import {Avatar} from "@material-ui/core";
import {Link, useParams} from "react-router-dom";
import Moment from "react-moment";
import {avatarStyles} from "../AvatarStyles";
import moment from "moment";

function SidebarChat(props) {

    const [timeLeft, setTimeLeft] = useState();
    const {waId} = useParams();
    const dateFormat = 'H:mm';
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

        let intervalId = setInterval(() => {
            calculateRemaining();
        }, 30000);

        return () => {
            clearInterval(intervalId);
        }
    }, [props.chatData.lastMessageTimestamp]);

    return (
        <Link to={ `/main/chat/${props.chatData.waId}` }>
            <div id={props.chatData.waId} className={'sidebarChat ' + (waId === props.chatData.waId ? 'activeChat' : '')}>
                <Avatar className={props.chatData.isExpired ? '' : avatarClasses[props.chatData.getAvatarClassName()]}>{props.chatData.initials}</Avatar>
                <div className="sidebarChat__info">
                    <h2>{props.chatData.name}</h2>
                    <p className="sidebarChat__info__lastMessage">
                        {((props.unseenMessages[props.chatData.waId]?.unseenMessages ?? 0) > 0 /*&& waId !== props.chatData.waId*/)
                            ?
                            <span className="sidebarChat__info__lastMessage__new">
                                {props.unseenMessages[props.chatData.waId]?.unseenMessages} new message(s)
                            </span>
                            :
                            <span>
                                Last message at <Moment date={props.chatData.lastMessageTimestamp} format={dateFormat} unix />
                            </span>
                        }
                    </p>

                    {props.chatData.isExpired
                        ?
                        <p className="sidebarChat__info__expired">Expired</p>
                        :
                        <p className="sidebarChat__info__timeLeft">
                            {timeLeft} left
                        </p>
                    }

                </div>
            </div>
        </Link>
    )
}

export default SidebarChat