import React from 'react';
import Linkify from 'react-linkify';

const Text = ({ data: { text } }) => {
	return <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
		<a target="blank" href={decoratedHref} key={key}>
			{decoratedText}
		</a>)}>{text}</Linkify>
};

export default Text;
