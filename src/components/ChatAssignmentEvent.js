import React from "react";
import '../styles/ChatAssignmentEvent.css';

function ChatAssignmentEvent(props) {
    return (
        <div className="chatAssignmentEvent">
            <div className="chatAssignmentEvent__content">
                <span className="bold">{props.data.done_by?.username}</span>:
                {/*{JSON.stringify(props.data)}*/}

                {props.data.assigned_to_user_set ? ' assigned to user: ' + props.data.assigned_to_user_set.username : ''}

                {props.data.assigned_group_set ? ' assigned to group: ' + props.data.assigned_group_set.name : ''}

                {props.data.assigned_to_user_was_cleared ? ' cleared assigned user' : ''}

                {props.data.assigned_group_was_cleared ? ' cleared assigned group' : ''}
            </div>
        </div>
    )
}

export default ChatAssignmentEvent;