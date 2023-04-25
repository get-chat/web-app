import {
	getSelectionHtml,
	sanitize,
	translateHTMLInputToText,
} from '@src/helpers/Helpers';
import { EMPTY_IMAGE_BASE64 } from '@src/Constants';
import { ClipboardEvent } from 'react';

export type Props = {
	setInput: (text: string) => void;
};

const useChatFooter = ({ setInput }: Props) => {
	function insertAtCursor(el: any, html: any) {
		if (!html) return;

		// Sanitize input
		html = sanitize(html);

		// Preserving new lines
		html = html.replace(/(?:\r\n|\r|\n)/g, '<br>');

		//html = html.replace('<span', '<span contentEditable="false"');
		html = html
			.replace('<span', '<img src="' + EMPTY_IMAGE_BASE64 + '"')
			.replace('</span>', '');
		el.focus();

		let selection = window.getSelection();
		if (selection) {
			let range = selection.getRangeAt(0);
			range.deleteContents();
			let node = range.createContextualFragment(html);
			range.insertNode(node);

			// Persist cursor position
			selection.collapseToEnd();
		}

		//el.dispatchEvent(new Event('input'));
		setInput(el.innerHTML);
	}

	const handleCopy = (event: ClipboardEvent) => {
		let data = getSelectionHtml();
		data = translateHTMLInputToText(data);
		event.clipboardData.setData('text', data);

		event.preventDefault();
	};

	return {
		insertAtCursor,
		handleCopy,
	};
};

export default useChatFooter;
