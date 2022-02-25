import React from "react";
import '../../../../styles/ChatTaggingEvent.css';
import Moment from "react-moment";
import {Trans} from "react-i18next";

function ChatTaggingEvent(props) {

    const dateFormat = 'H:mm';

    return (
        <div className="chatTaggingEvent">
            <div className="chatTaggingEvent__content">
                <div className="chatTaggingEvent__content__title">
                    {props.data.done_by
                        ?
                        <div>
                            <Trans values={{postProcess: 'sprintf', sprintf: {'username': props.data.done_by.username, 'tag': props.data.tag?.name}}}>
                                <span className="bold">%(username)s</span> has {props.data.action} tag: <span
                                className="bold"
                                style={{color: props.data.tag?.web_inbox_color}}>%(tag)s</span>.
                            </Trans>
                        </div>
                        :
                        <div>
                            <Trans values={{postProcess: 'sprintf', sprintf: {'tag': props.data.tag?.name}}}>
                                A tag was {props.data.action}: <span className="bold"
                                                                      style={{color: props.data.tag?.web_inbox_color}}>%(tag)s</span>.
                            </Trans>
                        </div>
                    }
                </div>

                <div className="chatTaggingEvent__content__timestamp">
                    <Moment date={props.data.timestamp} format={dateFormat} unix/>
                </div>
            </div>
        </div>
    )
}

export default ChatTaggingEvent;