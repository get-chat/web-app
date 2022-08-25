import React, { useMemo } from 'react';
import cn from 'classnames';

import emojiTree from 'emoji-tree';
import isEmoji from 'emoji-tree/lib/isEmoji';

import Text from './components/Text';
import Emoji from './components/Emoji';

const getTextNodeType = (node) => {
	if (isEmoji(node)) {
		return {
			type: 'emoji',
			single: false,
			component: Emoji,
		};
	}

	return {
		type: 'text',
		component: Text,
	};
};

const decomposeMessage = (message, highlightText) => {
	if (!message) return [];

	const regex = new RegExp(highlightText, 'gi');
	let section = '';

	if (highlightText) {
		message = message
			.replace(regex, (match) => {
				return `<mark class="highlight">${match}</mark>`;
			})
			.replace(/\n/g, '<br />');
	}

	let result = emojiTree(message).reduce((acc, item) => {
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

	result.push(section);
	section = '';

	return []
		.concat(...result)
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
	const splittedMessage = useMemo(
		() => decomposeMessage(message, highlightText),
		[message, highlightText]
	);
	const classNames = cn('printMessage', className);

	// single emoji
	if (splittedMessage.length === 1 && splittedMessage[0].type === 'emoji') {
		splittedMessage[0].single = !smallEmoji;
	}

	return (
		<Tag className={classNames}>
			{splittedMessage.map((item) => {
				const Component = item.component;

				return <Component data={item} key={item.index} />;
			})}
		</Tag>
	);
};

export default PrintMessage;
