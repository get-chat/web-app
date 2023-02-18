import React from 'react';

import { replaceEmojis } from '@src/helpers/EmojiHelper';

const Emoji = ({ data: { text, single } }) => {
	return (
		<span dangerouslySetInnerHTML={{ __html: replaceEmojis(text, !single) }} />
	);
};

export default Emoji;
