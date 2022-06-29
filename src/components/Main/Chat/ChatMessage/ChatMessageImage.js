import React from 'react';

function ChatMessageImage(props) {
	return (
		<img
			className="chat__media"
			src={props.source}
			alt={props.data.caption}
			onClick={() => props.onPreview(props.data)}
		/>
	);
}

export default ChatMessageImage;
