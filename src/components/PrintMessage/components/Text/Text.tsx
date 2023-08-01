import React, { useMemo } from 'react';
// @ts-ignore
import reactStringReplace from 'react-string-replace-recursively';
import { PrintMessageComponentProps } from '@src/components/PrintMessage/components/PrintMessageComponentProps';
import Linkify from 'linkify-react';

const Text: React.FC<PrintMessageComponentProps> = ({
	data: { text },
	linkify,
}) => {
	return useMemo(() => {
		const boldRegex = /\*(.*?)\*/gi;
		const italicRegex = /_(.*?)_/gi;
		const strikeRegex = /~(.*?)~/gi;
		const codeRegex = /```(.*?)```/gi;

		const config = {
			bold: {
				pattern: boldRegex,
				matcherFn: function (
					rawText: string,
					processed: JSX.Element,
					key: string
				) {
					return <strong key={key}>{processed}</strong>;
				},
			},
			italic: {
				pattern: italicRegex,
				matcherFn: function (
					rawText: string,
					processed: JSX.Element,
					key: string
				) {
					return <i key={key}>{processed}</i>;
				},
			},
			strike: {
				pattern: strikeRegex,
				matcherFn: function (
					rawText: string,
					processed: JSX.Element,
					key: string
				) {
					return <s key={key}>{processed}</s>;
				},
			},
			code: {
				pattern: codeRegex,
				matcherFn: function (
					rawText: string,
					processed: JSX.Element,
					key: string
				) {
					return <code key={key}>{processed}</code>;
				},
			},
		};

		return linkify ? (
			<Linkify options={{ target: '_blank' }}>
				{reactStringReplace(config)(text)}
			</Linkify>
		) : (
			reactStringReplace(config)(text)
		);
	}, [text]);
};

export default Text;
