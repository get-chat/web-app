import React, { useEffect, useState } from 'react';
import LabelIcon from '@material-ui/icons/Label';
import { useSelector } from 'react-redux';

const ChatTag = ({ id }) => {
	const tags = useSelector((state) => state.tags.value);

	const [tag, setTag] = useState();

	useEffect(() => {
		if (tags) {
			for (let i = 0; i < tags.length; i++) {
				const curTag = tags[i];
				console.log(curTag);
				console.log(curTag.id);
				if (curTag.id === id) {
					setTag(curTag);

					console.log(curTag);
					break;
				}
			}
		}
	}, [id, tags]);

	return (
		<LabelIcon
			style={{
				fill: tag?.web_inbox_color ?? 'white',
			}}
		/>
	);
};

export default ChatTag;
