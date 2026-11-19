import { translateHTMLInputToText } from './Helpers';

describe('translateHTMLInputToText', () => {
	it('keeps a single line break', () => {
		expect(translateHTMLInputToText('a<br>b')).toBe('a\nb');
	});

	it('keeps an empty line between paragraphs', () => {
		expect(translateHTMLInputToText('a<br><br>b')).toBe('a\n\nb');
	});

	it('keeps several empty lines', () => {
		expect(translateHTMLInputToText('a<br><br><br>b')).toBe('a\n\n\nb');
	});

	it('reads what Chrome makes of Shift+Enter in the composer', () => {
		// a ⇧↵ b ⇧↵⇧↵⇧↵ c ⇧↵
		expect(translateHTMLInputToText('a<br>b<br><br><br>c<br><br>')).toBe(
			'a\nb\n\n\nc'
		);
	});

	it('ignores the placeholder break the browser leaves at the end', () => {
		expect(translateHTMLInputToText('a<br>b<br>')).toBe('a\nb');
		expect(translateHTMLInputToText('<br>')).toBe('');
	});

	it('puts each block on its own line', () => {
		expect(translateHTMLInputToText('<div>a</div><div>b</div>')).toBe('a\nb');
		expect(translateHTMLInputToText('a<div>b</div>')).toBe('a\nb');
		expect(translateHTMLInputToText('a<div>b</div>c')).toBe('a\nb\nc');
		expect(translateHTMLInputToText('<p>a</p><p>b</p>')).toBe('a\nb');
	});

	it('keeps empty lines made of empty blocks', () => {
		expect(translateHTMLInputToText('a<div><br></div><div>b</div>')).toBe(
			'a\n\nb'
		);
		expect(
			translateHTMLInputToText('<div>a</div><div><br></div><div>b</div>')
		).toBe('a\n\nb');
		expect(translateHTMLInputToText('<div>a<br></div><div>b</div>')).toBe(
			'a\nb'
		);
	});

	it('drops leading and trailing line breaks', () => {
		expect(translateHTMLInputToText('<br><br>a<br><br>')).toBe('a');
	});

	it('keeps inline formatting as text', () => {
		expect(translateHTMLInputToText('<b>a</b> <span>b</span>')).toBe('a b');
	});

	it('keeps the HTML encoding and turns non-breaking spaces into spaces', () => {
		expect(translateHTMLInputToText('a&nbsp;&nbsp;b &amp; &lt;c&gt;')).toBe(
			'a  b &amp; &lt;c&gt;'
		);
	});

	it('turns emoji images into their character', () => {
		expect(
			translateHTMLInputToText(
				'hi <img src="data:x" aria-label="😀, grinning face" class="emoji">'
			)
		).toBe('hi 😀');
	});
});
