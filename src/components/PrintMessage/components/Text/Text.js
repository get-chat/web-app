import React from 'react';
import reactStringReplace from 'react-string-replace';

const Text = ({ data: { text } }) => {
	const italicRegex = /_(.*?)_/gi;
	const boldRegex = /\*(.*?)\*/gi;

	let formattedText = reactStringReplace(text, italicRegex, (match, index) => (
		<i key={index}>{match}</i>
	));

	formattedText = reactStringReplace(
		formattedText,
		boldRegex,
		(match, index) => <strong key={index}>{match}</strong>
	);

	return formattedText;
};

export default Text;
