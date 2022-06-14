import React from "react";

import { replaceEmojis } from "../../../../helpers/EmojiHelper";

const Emoji = ({ data }) => {
    return (
        <span dangerouslySetInnerHTML={{ __html: replaceEmojis(data, true) }} />
    );
};

export default Emoji;
