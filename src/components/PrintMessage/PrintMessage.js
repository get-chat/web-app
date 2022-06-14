import React, { useMemo } from "react";
import cn from "classnames";

import emojiTree from "emoji-tree";
import isEmoji from "emoji-tree/lib/isEmoji";

import Text from "./components/Text";
import Link from "./components/Link";
import Emoji from "./components/Emoji";

const linkRegExp = new RegExp(
    /((?<!\+)https?:\/\/(?:www\.)?(?:[-\w.]+?[.@][a-zA-Z\d]{2,}|localhost)(?:[-\w.:%+~#*$!?&/=@]*?(?:,(?!\s))*?)*)/,
    "gmi"
);

const getTextNodeType = (node) => {
    if (linkRegExp.test(node)) {
        return {
            type: "link",
            component: Link,
        };
    }

    if (isEmoji(node)) {
        return {
            type: "emoji",
            component: Emoji,
        };
    }

    return {
        type: "text",
        component: Text,
    };
};

const decomposeMessage = (message) => {
    let section = "";

    const result = emojiTree(message).reduce((acc, item) => {
        if (item.type === "emoji") {
            if (section) {
                acc.push(section.split(linkRegExp));
                section = "";
            }

            acc.push(item.text);
        } else {
            section += item.text;
        }

        return acc;
    }, []);

    result.push(section.split(linkRegExp));
    section = "";

    return [].concat(...result).map((item, index) => ({
        index,
        data: item,
        ...getTextNodeType(item),
    }));
};

const PrintMessage = ({ message, as: Tag = "span", className }) => {
    const splittedMessage = useMemo(() => decomposeMessage(message), [message]);
    const classNames = cn("printMessage", className);

    return (
        <Tag className={classNames}>
            {splittedMessage.map((item) => {
                const Component = item.component;

                return <Component data={item.data} key={item.index} />;
            })}
        </Tag>
    );
};

export default PrintMessage;
