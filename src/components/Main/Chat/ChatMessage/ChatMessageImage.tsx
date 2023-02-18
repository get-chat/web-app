import React from 'react';
import Image from '../../../Image';

function ChatMessageImage({ className, source, data, onPreview }) {
	return (
		<Image
			className={'chat__media' + (className ? ' ' + className : '')}
			src={source}
			alt={data.caption}
			onClick={onPreview}
		/>
	);
}

export default ChatMessageImage;
