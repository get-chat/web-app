// @ts-ignore
import dompurify from 'dompurify';
import { getObjLength } from './ObjectHelper';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { getMessageTimestamp } from '@src/helpers/MessageHelper';

export const isString = (anyVar: any) => {
	return typeof anyVar === 'string';
};

export const isEmptyString = (str: string | null | undefined): boolean => {
	return !str || str.trim().length === 0;
};

export const translateHTMLInputToText = (html: string) => {
	let result;
	const reg = new RegExp(
		'<img\\s[^>]*?src\\s*=\\s*[\'\\"]([^\'\\"]*?)[\'\\"][^>]*?>',
		'g'
	);
	result = html.replace(reg, function (occurrences) {
		// Extract unicode from aria-label
		const matches = occurrences.match(
			new RegExp('aria-label="\\s*(.*?)\\s*,'),
			// @ts-ignore
			'$1'
		);
		if (matches && matches.length >= 1) {
			return matches[1];
		}
		return '';
	});

	// Convert it to plain text
	return composerHtmlToText(result);
};

// Elements that sit on lines of their own in the composer
const BLOCK_TAGS = new Set([
	'p',
	'div',
	'hr',
	'title',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'ol',
	'ul',
	'li',
	'pre',
	'table',
	'tr',
	'th',
	'td',
	'blockquote',
	'header',
	'footer',
	'nav',
	'section',
	'summary',
	'aside',
	'article',
	'address',
]);

const SKIPPED_TAGS = new Set(['script', 'style', 'template']);

// The text keeps the HTML encoding of the input (callers decode it), only
// non-breaking spaces become plain ones
const encodeText = (text: string) =>
	text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\u00a0/g, ' ');

// Turns the composer's HTML into the lines it shows: every <br> ends a line,
// so "a<br><br>b" keeps its empty line, while a block only starts a new line
// when the current one has text, so "<div>a</div><div>b</div>" is two lines
// and the <br> the browser leaves at the end of a block adds none
const composerHtmlToText = (html: string) => {
	const template = document.createElement('template');
	template.innerHTML = html;

	const lines: string[] = [];
	let line = '';
	let lineHasContent = false;

	const endLine = () => {
		lines.push(line);
		line = '';
		lineHasContent = false;
	};

	const walk = (parent: Node) => {
		parent.childNodes.forEach((node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.nodeValue ?? '';
				if (text) {
					line += encodeText(text);
					lineHasContent = true;
				}
				return;
			}

			if (node.nodeType !== Node.ELEMENT_NODE) return;

			const tag = (node as Element).localName;
			if (tag === 'br') {
				endLine();
				return;
			}
			if (SKIPPED_TAGS.has(tag)) return;

			const isBlock = BLOCK_TAGS.has(tag);
			if (isBlock && lineHasContent) endLine();
			walk(node);
			if (isBlock && lineHasContent) endLine();
		});
	};

	walk(template.content);
	if (lineHasContent) endLine();

	return lines.join('\n').replace(/^\n+|\n+$/g, '');
};

export const generateInitialsHelper = (name: string | undefined | null) => {
	return (
		name ? name.replace(/[^a-z\d\s]+/gi, '').trim()[0] : ''
	)?.toUpperCase();
};

export const generateUnixTimestamp = () => {
	return Math.round(+new Date() / 1000);
};

export const stringContainsAnyInArray = (string: string, array: string[]) => {
	for (let i = 0; i < array.length; i++) {
		if (string.includes(array[i])) {
			return true;
		}
	}

	return false;
};

export const getSelectionHtml = () => {
	let html = '';
	if (typeof window.getSelection != 'undefined') {
		const sel = window.getSelection();
		if (sel?.rangeCount) {
			const container = document.createElement('div');
			for (let i = 0, len = sel.rangeCount; i < len; ++i) {
				container.appendChild(sel.getRangeAt(i).cloneContents());
			}
			html = container.innerHTML;
		}
	} else {
		// @ts-ignore
		// Consider using document.getSelection()
		if (typeof document.selection != 'undefined') {
			// @ts-ignore
			if (document.selection.type === 'Text') {
				// @ts-ignore
				html = document.selection.createRange().htmlText;
			}
		}
	}
	return html;
};

export const displaySeconds = (seconds: number) => {
	const format = (val: number) => `0${Math.floor(val)}`.slice(-2);
	//const hours = seconds / 3600;
	const minutes = (seconds % 3600) / 60;

	return [minutes, seconds % 60].map(format).join(':');
};

export const containsLetters = (text: string | undefined | null) => {
	const regExp = /[a-zA-Z]/g;
	return text ? regExp.test(text) : false;
};

export const extractAvatarFromContactProviderData = (
	contactProviderData: any,
	isLarge?: boolean
) => {
	if (contactProviderData) {
		for (let i = 0; i < getObjLength(contactProviderData); i++) {
			const data = contactProviderData[i];
			if (data?.avatar) {
				return isLarge === true && data?.large_avatar
					? data.large_avatar
					: data.avatar;
			}
		}
	}

	return undefined;
};

export const hasInternetConnection = () => {
	return navigator.onLine;
};

export const sortMessagesAsc = (messages: ChatMessageList) => {
	let sortedNextState = Object.entries(messages).sort(
		(a, b) =>
			(getMessageTimestamp(a[1]) ?? -1) - (getMessageTimestamp(b[1]) ?? -1)
	);
	return Object.fromEntries(sortedNextState);
};

export const isScrollable = (el: Element) => {
	const hasScrollableContent = el.scrollHeight > el.clientHeight;
	const overflowYStyle = window.getComputedStyle(el).overflowY;
	const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

	return hasScrollableContent && !isOverflowHidden;
};

export const sanitize = (dirty: string | undefined | null) => {
	if (!dirty) return;
	const sanitizer = dompurify.sanitize;
	return sanitizer(dirty);
};

export const generateUniqueID = () => {
	return `${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`;
};
