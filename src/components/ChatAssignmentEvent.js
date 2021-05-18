import React from "react";

function ChatAssignmentEvent(props) {
    return (
        <div>
            {props.data.done_by?.username}
            {/*{JSON.stringify(props.data)}*/}

            {props.data.assigned_to_user_set ? ' assigned to user: ' + props.data.assigned_to_user_set.username : ''}

            {props.data.assigned_group_set ? ' assigned to group: ' + props.data.assigned_group_set.name : ''}

            {props.data.assigned_to_user_was_cleared ? ' cleared assigned user' : ''}
        </div>
    )
}

export default ChatAssignmentEvent;