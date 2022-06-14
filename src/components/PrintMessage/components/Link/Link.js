import React from "react";

import { linkify } from "../../../../helpers/MessageHelper";

const Link = ({ data }) => {
    return <span dangerouslySetInnerHTML={{ __html: linkify(data) }} />;
};

export default Link;
