import React from 'react';

const HighlightText = ({ data: { text } }) => {
	return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

export default HighlightText;
