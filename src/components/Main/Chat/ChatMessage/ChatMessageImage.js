import React from 'react';
import Image from '../../../Image';

function ChatMessageImage(props) {
	return (
		<Image
			className="chat__media"
			src={props.source}
			alt={props.data.caption}
			onClick={() => props.onPreview(props.data)}
		/>
	);
}

export default ChatMessageImage;
