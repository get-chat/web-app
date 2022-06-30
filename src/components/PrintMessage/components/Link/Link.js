import React from 'react';

import { linkify } from '../../../../helpers/MessageHelper';

const Link = ({ data: { text } }) => {
	return <span dangerouslySetInnerHTML={{ __html: linkify(text) }} />;
};

export default Link;
