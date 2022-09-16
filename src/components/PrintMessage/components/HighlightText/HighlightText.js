import React from 'react';
import Linkify from 'react-linkify';

const HighlightText = ({ data: { text } }) => {
	return (
		<Linkify
			componentDecorator={(decoratedHref, decoratedText, key) => (
				<a target="blank" href={decoratedHref} key={key}>
					{decoratedText}
				</a>
			)}
		>
			<span dangerouslySetInnerHTML={{ __html: text }} />
		</Linkify>
	);
};

export default HighlightText;
