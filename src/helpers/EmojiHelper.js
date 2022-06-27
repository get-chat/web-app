import { Emoji, getEmojiDataFromNative } from 'emoji-mart';
import { EMOJI_SET, EMOJI_SHEET_SIZE } from '../Constants';
import data from '../EmojiData.json';

const emojiRegex = require('emoji-regex/RGI_Emoji.js');

function containsOnlyEmojis(text) {
    const onlyEmojis = text.replace(new RegExp('[\u0000-\u1eeff]', 'g'), '');
    const visibleChars = text.replace(new RegExp('[\n\rs]+|( )+', 'g'), '');
    return onlyEmojis.length === visibleChars.length;
}

export const replaceEmojis = (message, ignoreOnlyEmojis) => {
    if (!message) return;

    const onlyEmojis = !ignoreOnlyEmojis ? containsOnlyEmojis(message) : false;
    const regex = emojiRegex();

    return message.replace(regex, function (occurrence) {
        // TODO: Finding emoji data is too slow, find an alternative or improve it
        const emojiData = getEmojiDataFromNative(occurrence, EMOJI_SET, data);
        if (emojiData) {
            const emoji = Emoji({
                html: true,
                emoji: emojiData,
                size: onlyEmojis ? 44 : 22,
                set: EMOJI_SET,
                sheetSize: EMOJI_SHEET_SIZE,
            });

            // Emoji might be null
            return emoji ?? occurrence;
        } else {
            return occurrence;
        }
    });
};
