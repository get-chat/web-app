import React from "react";
import {Avatar} from "@material-ui/core";

function Contact(props) {
    return (
        <div>
            <Avatar src={props.data.avatar}>{props.data.initials}</Avatar>
            <div>
                {props.data.name}
                {JSON.stringify(props.data)}
            </div>
        </div>
    )
}

export default Contact;