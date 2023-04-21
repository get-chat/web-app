// @ts-nocheck
import React, { useMemo } from 'react';
import LabelIcon from '@mui/icons-material/Label';
import { useAppSelector } from '@src/store/hooks';

const ChatTag = ({ id }) => {
	const tags = useAppSelector((state) => state.tags.value);

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
