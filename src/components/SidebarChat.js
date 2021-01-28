import React from 'react';
import '../styles/SidebarChat.css';
import {Avatar} from "@material-ui/core";
import {Link} from "react-router-dom";
import Moment from "react-moment";

function SidebarChat(props) {

    const dateFormat = 'H:mm';

    return(
        <Link to={ `/main/chat/${props.id}` }>
            <div id={props.id} className="sidebarChat">
                <Avatar>{props.initials}</Avatar>
                <div className="sidebarChat__info">
                    <h2>{props.name}</h2>
                    <p><Moment date={props.lastMessage} format={dateFormat} unix /></p>
                </div>
            </div>
        </Link>
    )
}

export default SidebarChat