import React, {useEffect, useState} from 'react';
import '../../styles/SidebarChat.css';
import {Avatar, Checkbox, ListItem, Tooltip} from "@material-ui/core";
import {useHistory, useParams} from "react-router-dom";
import LabelIcon from '@material-ui/icons/Label';
import GroupIcon from '@material-ui/icons/Group';
import Moment from "react-moment";
import {avatarStyles} from "../../AvatarStyles";
import moment from "moment";
import {
    addPlus,
    extractAvatarFromContactProviderData,
    generateInitialsHelper,
    markOccurrences,
    replaceEmojis
} from "../../Helpers";
import {getDroppedFiles, handleDragOver} from "../../FileHelpers";
import PubSub from "pubsub-js";
import {CALENDAR_SHORT, EVENT_TOPIC_DROPPED_FILES} from "../../Constants";
import ChatMessageShortContent from "../Chat/ChatMessage/ChatMessageShortContent";

function SidebarChat(props) {

    const history = useHistory();

    const [isSelected, setSelected] = useState(false);
    const [isExpired, setExpired] = useState(props.chatData.isExpired);
    const [timeLeft, setTimeLeft] = useState();
    const [remainingSeconds, setRemainingSeconds] = useState();
    const {waId} = useParams();
    const avatarClasses = avatarStyles();

    useEffect(() => {
        props.retrieveContactData(props.chatData.waId);
    }, []);

    useEffect(() => {
        // Set chat unselected, if selection mode is off
        if (!props.isSelectionModeEnabled) {
            setSelected(false);
        }
    }, [props.isSelectionModeEnabled]);

    const generateTagNames = () => {
        const generatedTagNames = [];
        props.chatData.tags?.forEach((tag) => {
            generatedTagNames.push(tag.name);
        });
        return generatedTagNames.join(', ');
    }

    useEffect(() => {
        function calculateRemaining() {
            const momentDate = moment.unix(props.chatData.lastReceivedMessageTimestamp);
            momentDate.add(1, 'day');
            const curDate = moment(new Date());
            const hours = momentDate.diff(curDate, 'hours');
            const seconds = momentDate.diff(curDate, 'seconds');

            setRemainingSeconds(seconds);

            let suffix;

            if (hours > 0) {
                suffix = 'h';
                setTimeLeft(hours + suffix);
            } else {
                const minutes = momentDate.diff(curDate, 'minutes');
                if (minutes > 1) {
                    suffix = 'm';
                    setTimeLeft(minutes + suffix);
                } else {
                    if (seconds > 1) {
                        suffix = 'm';
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

    const handleClick = () => {
        if (props.isSelectionModeEnabled) {
            let newSelectedState;
            setSelected(prevState => {
                newSelectedState = !prevState;
                return newSelectedState;
            });

            props.setSelectedChats(prevState => {
                if (newSelectedState) {
                    if (!prevState.includes(props.chatData.waId)) {
                        prevState.push(props.chatData.waId);
                    }
                } else {
                    prevState = prevState.filter(arrayItem => arrayItem !== props.chatData.waId);
                }

                return [...prevState];
            });

        } else {
            history.push(`/main/chat/${props.chatData.waId}`);
        }
    }

    return (
        <ListItem button onClick={handleClick}>
            <div
                id={props.chatData.waId}
                className={
                    'sidebarChatWrapper '
                    + (waId === props.chatData.waId ? 'activeChat ' : '') + (isExpired ? 'expired ' : (remainingSeconds < 8 * 60 * 60 ? 'almostExpired ' : ''))
                    + (props.isSelectionModeEnabled && isSelected ? 'isSelected ' : '')
                }
                onDrop={(event) => handleDroppedFiles(event)}
                onDragOver={(event) => handleDragOver(event)}>

                <div className="sidebarChat">

                    {props.isSelectionModeEnabled &&
                    <Checkbox className="sidebarChat__selection" checked={isSelected} color="primary"/>
                    }

                    <div className="sidebarChat__avatarWrapper">
                        <Avatar src={extractAvatarFromContactProviderData(props.contactProvidersData[props.chatData.waId])}
                                className={isExpired ? '' : avatarClasses[props.chatData.getAvatarClassName()]}>
                            {props.chatData.initials}
                        </Avatar>

                        {(props.chatData.assignedToUser && ((props.tabCase === 'all') || (props.tabCase === 'group'))) &&
                        <Tooltip title={props.chatData.generateAssignmentInformation()}>
                            <Avatar className={"sidebarChat__avatarWrapper__assignee " + avatarClasses[props.chatData.generateAssignedToInitials()]}>
                                {generateInitialsHelper(props.chatData.generateAssignedToInitials())}
                            </Avatar>
                        </Tooltip>
                        }

                        {(props.chatData.assignedGroup
                            && ((props.tabCase === 'all' && !props.chatData.assignedToUser) || (props.tabCase === 'me') || (props.tabCase === 'group' && !props.chatData.assignedToUser))) &&
                        <Tooltip title={props.chatData.generateAssignmentInformation()}>
                            <Avatar className={"sidebarChat__avatarWrapper__assignee " + avatarClasses[props.chatData.generateAssignedGroupInitials()]}>
                                <GroupIcon />
                            </Avatar>
                        </Tooltip>
                        }
                    </div>

                    <div className="sidebarChat__info">

                        <div className="sidebarChat__info__nameWrapper">
                            <h2>
                                {(props.keyword !== undefined && props.keyword.trim().length > 0)
                                    ?
                                    <span dangerouslySetInnerHTML={{__html: markOccurrences(replaceEmojis(props.chatData.name), props.keyword)}}/>
                                    :
                                    <span dangerouslySetInnerHTML={{__html: replaceEmojis(props.contactProvidersData[props.chatData.waId]?.[0]?.name ?? props.chatData.name)}} />
                                }

                                {props.chatData.tags?.length > 0 &&
                                <div className="sidebarChat__info__tags">
                                    <Tooltip title={generateTagNames()}>
                                        <LabelIcon className={props.chatData.tags.length > 1 ? "multiple" : ""} style={{fill: props.chatData.tags[0].web_inbox_color}} />
                                    </Tooltip>
                                </div>
                                }
                            </h2>

                            <div className="sidebarChat__info__date">
                                {props.chatData.lastMessageTimestamp &&
                                <Moment
                                    className="sidebarChat__info__nameWrapper__lastMessageDate"
                                    date={props.chatData.lastMessageTimestamp}
                                    calendar={CALENDAR_SHORT}
                                    unix />
                                }

                                {!isExpired &&
                                <span className="sidebarChat__info__date__timeLeft">{timeLeft} left</span>
                                }
                            </div>
                        </div>

                        <div className="sidebarChat__info__lastMessage">
                            {((props.newMessages[props.chatData.waId]?.newMessages ?? 0) > 0 /*&& waId !== props.chatData.waId*/)
                                ?
                                <div className="sidebarChat__info__lastMessage__new">
                                    {props.newMessages[props.chatData.waId]?.newMessages} new message(s)
                                </div>
                                :
                                <div className="sidebarChat__info__lastMessage__body">
                                    <ChatMessageShortContent
                                        type={props.chatData.lastMessageType}
                                        buttonText={props.chatData.lastMessageButtonText}
                                        text={props.chatData.lastMessageBody}
                                        caption={props.chatData.lastMessageCaption}
                                        isLastMessageFromUs={props.chatData.isLastMessageFromUs } />
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <span className="sidebarChatWrapper__waId">{addPlus(props.chatData.waId)}</span>

            </div>
        </ListItem>
    )
}

export default SidebarChat