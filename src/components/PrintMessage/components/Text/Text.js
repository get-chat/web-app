import React, { useMemo } from 'react';
import reactStringReplace from 'react-string-replace';

const Text = ({ data: { text } }) => {
	return useMemo(() => {
		const boldRegex = /\*(.*?)\*/gi;
		const italicRegex = /_(.*?)_/gi;
		const strikeRegex = /~(.*?)~/gi;

		let formattedText = text;

		formattedText = reactStringReplace(
			formattedText,
			boldRegex,
			(match, index) => <strong key={'bold_' + index}>{match}</strong>
		);

		formattedText = reactStringReplace(
			formattedText,
			italicRegex,
			(match, index) => <i key={'italic_' + index}>{match}</i>
		);

		formattedText = reactStringReplace(
			formattedText,
			strikeRegex,
			(match, index) => <s key={'strike_' + index}>{match}</s>
		);

		return formattedText;
	}, [text]);
};

export default Text;
