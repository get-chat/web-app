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

		return reactStringReplace(config)(text);
	}, [text]);
};

export default Text;
