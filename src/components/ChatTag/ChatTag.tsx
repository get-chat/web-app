import React, { useMemo } from 'react';
import { useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';

interface Props {
	id?: number;
}

const ChatTag: React.FC<Props> = ({ id }) => {
	const tags = useAppSelector((state) => state.tags.value);

	const tag = useMemo(() => {
		if (tags && id) {
			return tags.find((tag) => tag.id === id);
		}
	}, [tags, id]);

	return (
		<SellIcon
			style={{
				fill: tag?.color ?? 'white',
			}}
		/>
	);
};

export default ChatTag;
