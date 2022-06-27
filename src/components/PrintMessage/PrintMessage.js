import React, { useMemo } from 'react';
import cn from 'classnames';

import emojiTree from 'emoji-tree';
import isEmoji from 'emoji-tree/lib/isEmoji';

import Text from './components/Text';
import Link from './components/Link';
import Emoji from './components/Emoji';

const linkRegExp = new RegExp(
    /((?<!\+)https?:\/\/(?:www\.)?(?:[-\w.]+?[.@][a-zA-Z\d]{2,}|localhost)(?:[-\w.:%+~#*$!?&/=@]*?(?:,(?!\s))*?)*)/,
    'gmi'
);

const getTextNodeType = (node) => {
    if (linkRegExp.test(node)) {
        return {
            type: 'link',
            component: Link,
        };
    }

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

const decomposeMessage = (message) => {
    let section = '';

    const result = emojiTree(message).reduce((acc, item) => {
        if (item.type === 'emoji') {
            if (section) {
                acc.push(section.split(linkRegExp));
                section = '';
            }

            acc.push(item.text);
        } else {
            section += item.text;
        }

        return acc;
    }, []);

    result.push(section.split(linkRegExp));
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
    className,
}) => {
    const splittedMessage = useMemo(() => decomposeMessage(message), [message]);
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
