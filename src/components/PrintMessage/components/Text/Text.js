import React from 'react';
import reactStringReplace from 'react-string-replace';

const Text = ({ data: { text } }) => {
	const regex = /\*(.*?)\*/gi;
	return reactStringReplace(text, regex, (match, index) => (
		<strong key={index}>{match}</strong>
	));
};

export default Text;
