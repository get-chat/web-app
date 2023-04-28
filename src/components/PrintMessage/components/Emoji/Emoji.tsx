import React from 'react';

import { replaceEmojis } from '@src/helpers/EmojiHelper';
import { PrintMessageComponentProps } from '@src/components/PrintMessage/components/PrintMessageComponentProps';

const Emoji: React.FC<PrintMessageComponentProps> = ({
	data: { text, single },
}) => {
	return (
		<span dangerouslySetInnerHTML={{ __html: replaceEmojis(text, !single) }} />
	);
};

export default Emoji;
