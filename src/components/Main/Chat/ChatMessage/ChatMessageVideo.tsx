import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function ChatMessageVideo({ source, onPreview }) {
	return (
		<div className="chat__videoWrapper" onClick={onPreview}>
			<video className="chat__media" src={source} preload="none" />
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
