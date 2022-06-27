import React from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

function ChatMessageVideo(props) {
    return (
        <div
            className="chat__videoWrapper"
            onClick={() => props.onPreview(props.data)}
        >
            <video className="chat__media" src={props.source} preload="none" />
            <span className="chat__videoWrapper__iconWrapper">
                <PlayArrowIcon
                    fontSize={'large'}
                    style={{ fill: 'white', fontSize: 40 }}
                />
            </span>
        </div>
    );
}

export default ChatMessageVideo;
