// @ts-nocheck
import React, { useMemo } from 'react';
import cn from 'classnames';

import emojiTree from 'emoji-tree';
import isEmoji from 'emoji-tree/lib/isEmoji';

import Text from './components/Text';
import HighlightText from './components/HighlightText';
import Emoji from './components/Emoji';
import Linkify from 'react-linkify';

const getTextNodeType = (node) => {
	if (isEmoji(node)) {
		return {
			type: 'emoji',
			single: false,
			component: Emoji,
		};
	}

	if (node.match(/<mark class="highlight">(.*?)<\/mark>/gi)) {
		return {
			type: 'highlight',
			component: HighlightText,
		};
	}

	return {
		type: 'text',
		component: Text,
	};
};

const decomposeMessage = (message, highlightText) => {
	if (!message) return [];

	let section = '';

	if (highlightText) {
		const regex = new RegExp(
			highlightText.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'),
			'gi'
		);

		message = message
			.replace(regex, (match) => {
				return `<mark class="highlight">${match}</mark>`;
			})
			.replace(/\n/g, '<br />');
	}

	let splitWithEmoji = emojiTree(message).reduce((acc, item) => {
		if (item.type === 'emoji') {
			if (section) {
				acc.push(section);
				section = '';
			}

			acc.push(item.text);
		} else {
			section += item.text;
		}

		return acc;
	}, []);

	splitWithEmoji.push(section);
	section = '';

	const splitWithHighlight = [];

	splitWithEmoji.forEach((item) => {
		splitWithHighlight.push(
			item.split(/(<mark class="highlight">.*.<\/mark>)/gi)
		);
	});

	return []
		.concat(...splitWithHighlight)
		.filter((item) => item !== '')
		.map((item, index) => ({
			index,
			text: item,
			...getTextNodeType(item),
		}));
};

const PrintMessage = ({
	message,
	as: Tag = 'span',
	smallEmoji = false,
	highlightText,
	className,
}) => {
	const splitMessage = useMemo(
		() => decomposeMessage(message, highlightText),
		[message, highlightText]
	);
	const classNames = cn('printMessage', className);

	// single emoji
	if (splitMessage.length === 1 && splitMessage[0].type === 'emoji') {
		splitMessage[0].single = !smallEmoji;
	}

	return (
		<Linkify
			componentDecorator={(decoratedHref, decoratedText, key) => (
				<a target="blank" href={decoratedHref} key={key}>
					{decoratedText}
				</a>
			)}
		>
			<Tag className={classNames}>
				{splitMessage.map((item) => {
					const Component = item.component;

					return <Component data={item} key={item.index} />;
				})}
			</Tag>
		</Linkify>
	);
};

export default PrintMessage;
