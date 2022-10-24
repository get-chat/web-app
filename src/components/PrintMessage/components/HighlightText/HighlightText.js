import React from 'react';
import DOMPurify from 'dompurify';

const HighlightText = ({ data: { text } }) => {
	return (
		<span
			dangerouslySetInnerHTML={{
				__html: DOMPurify.sanitize(text, { USE_PROFILES: { html: true } }),
			}}
		/>
	);
};

export default HighlightText;
