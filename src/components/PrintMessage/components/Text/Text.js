import React, { useMemo } from 'react';
import reactStringReplace from 'react-string-replace-recursively';

const Text = ({ data: { text } }) => {
	return useMemo(() => {
		const boldRegex = /\*(.*?)\*/gi;
		const italicRegex = /_(.*?)_/gi;
		const strikeRegex = /~(.*?)~/gi;
		const codeRegex = /```(.*?)```/gi;

		const config = {
			bold: {
				pattern: boldRegex,
				matcherFn: function (rawText, processed, key) {
					return <strong key={key}>{processed}</strong>;
				},
			},
			italic: {
				pattern: italicRegex,
				matcherFn: function (rawText, processed, key) {
					return <i key={key}>{processed}</i>;
				},
			},
			strike: {
				pattern: strikeRegex,
				matcherFn: function (rawText, processed, key) {
					return <s key={key}>{processed}</s>;
				},
			},
			code: {
				pattern: codeRegex,
				matcherFn: function (rawText, processed, key) {
					return <code key={key}>{processed}</code>;
				},
			},
		};

		/*let formattedText = text;

		formattedText = reactStringReplaceRecursive(
			formattedText,
			boldRegex,
			(match, index) => <strong key={'bold_' + index}>{match}</strong>
		);

		formattedText = reactStringReplaceRecursive(
			formattedText,
			italicRegex,
			(match, index) => <i key={'italic_' + index}>{match}</i>
		);

		formattedText = reactStringReplaceRecursive(
			formattedText,
			strikeRegex,
			(match, index) => <s key={'strike_' + index}>{match}</s>
		);

		formattedText = reactStringReplaceRecursive(
			formattedText,
			codeRegex,
			(match, index) => <code key={'code_' + index}>{match}</code>
		);*/

		return reactStringReplace(config)(text);
	}, [text]);
};

export default Text;
