import React, { useMemo } from 'react';
import LabelIcon from '@material-ui/icons/Label';
import { useSelector } from 'react-redux';

const ChatTag = ({ id }) => {
	const tags = useSelector((state) => state.tags.value);

	const tag = useMemo(() => {
		if (tags && id) {
			return tags.find((tag) => tag.id === id);
		}
	}, [tags, id]);

	return (
		<LabelIcon
			style={{
				fill: tag?.web_inbox_color ?? 'white',
			}}
		/>
	);
};

export default ChatTag;
