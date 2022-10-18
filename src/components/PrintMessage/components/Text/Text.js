import React, { useMemo } from 'react';
import reactStringReplace from 'react-string-replace';

const Text = ({ data: { text } }) => {
	return useMemo(() => {
		const italicRegex = /_(.*?)_/gi;
		const boldRegex = /\*(.*?)\*/gi;

		let formattedText = text;

		formattedText = reactStringReplace(
			formattedText,
			italicRegex,
			(match, index) => <i key={'italic_' + index}>{match}</i>
		);

		formattedText = reactStringReplace(
			formattedText,
			boldRegex,
			(match, index) => <strong key={'bold_' + index}>{match}</strong>
		);

		return formattedText;
	}, [text]);
};

export default Text;
