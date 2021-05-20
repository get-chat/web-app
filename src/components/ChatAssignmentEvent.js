import React from "react";
import '../styles/ChatAssignmentEvent.css';
import Moment from "react-moment";

function ChatAssignmentEvent(props) {

    const dateFormat = 'H:mm';

    return (
        <div className="chatAssignmentEvent">
            <div className="chatAssignmentEvent__content">
                <div className="chatAssignmentEvent__content__title">
                    <span className="bold">{props.data.done_by?.username ?? 'a user'}</span> has changed chat assignments.
                </div>

                {props.data.assigned_to_user_set &&
                <div>
                    assigned to user: <span className="bold">{props.data.assigned_to_user_set.username}</span>
                </div>
                }

                {props.data.assigned_group_set &&
                <div>
                    assigned to group: <span className="bold">{props.data.assigned_group_set.name}</span>
                </div>
                }

                {props.data.assigned_to_user_was_cleared &&
                <div>
                    cleared assigned user
                </div>
                }

                {props.data.assigned_group_was_cleared &&
                <div>
                    cleared assigned group
                </div>
                }

                <div className="chatAssignmentEvent__content__timestamp">
                    <Moment date={props.data.timestamp} format={dateFormat} unix/>
                </div>
            </div>
        </div>
    )
}

export default ChatAssignmentEvent;