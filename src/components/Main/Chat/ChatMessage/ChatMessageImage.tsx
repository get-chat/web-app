import React from 'react';
import Image from '../../../Image';

interface Props {
	className?: string;
	source: string;
	data: any;
	onPreview?: () => void;
}

const ChatMessageImage: React.FC<Props> = ({
	className,
	source,
	data,
	onPreview,
}) => {
	return (
		<Image
			className={'chat__media' + (className ? ' ' + className : '')}
			src={source}
			alt={data.caption}
			onClick={onPreview}
		/>
	);
};

export default ChatMessageImage;
