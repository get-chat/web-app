import React from 'react';

import { replaceEmojis } from '../../../../helpers/EmojiHelper';

const Emoji = ({ data: { text, single } }) => {
    return (
        <span
            dangerouslySetInnerHTML={{ __html: replaceEmojis(text, !single) }}
        />
    );
};

export default Emoji;
