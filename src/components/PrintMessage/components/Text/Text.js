import React, { useMemo } from 'react';
import reactStringReplace from 'react-string-replace';

const Text = ({ data: { text } }) => {
	return useMemo(() => {
		const reactStringReplaceRecursive = (input, pattern, fn, key = 0) => {
			const isEmpty = (item) => {
				if (!item) return true;
				if (item.hasOwnProperty('props')) {
					return false;
				} else {
					return !item.length;
				}
			};

			if (!input) {
				return null;
			} else if (typeof input === 'string') {
				return reactStringReplace(input, pattern, fn);
			}

			const output = [];
			for (let i = 0; i < input.length; i++) {
				const item = input[i];
				if (item) {
					if (typeof item === 'string') {
						const next = reactStringReplace(item, pattern, fn);
						if (!isEmpty(next)) output.push(next);
					} else if (typeof item === 'object') {
						if (
							item.hasOwnProperty('props') &&
							item.props.hasOwnProperty('children')
						) {
							const next = reactStringReplaceRecursive(
								item.props.children,
								pattern,
								fn,
								key + 1
							);
							if (!isEmpty(next)) {
								const props = Object.assign(
									{ key: 'k' + key + 'i' + i },
									item.props
								);
								output.push(React.createElement(item.type, props, next));
							}
						} else {
							const next = reactStringReplaceRecursive(
								item,
								pattern,
								fn,
								key + 1
							);
							if (!isEmpty(next)) output.push(next);
						}
					}
				}
			}

			return output;
		};

		const boldRegex = /\*(.*?)\*/gi;
		const italicRegex = /_(.*?)_/gi;
		const strikeRegex = /~(.*?)~/gi;
		const codeRegex = /```(.*?)```/gi;

		let formattedText = text;

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
		);

		return formattedText;
	}, [text]);
};

export default Text;
