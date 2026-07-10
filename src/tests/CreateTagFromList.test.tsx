import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatTagsList from '@src/components/Main/ChatTagsList/ChatTagsList';
import { createTag } from '@src/api/tagsApi';

jest.mock('@src/api/tagsApi', () => ({
	createTag: jest.fn(),
	fetchTags: jest.fn(),
}));

// Guard: the filter dialog must never assign the tag to a chat.
jest.mock('@src/api/chatTaggingApi', () => ({
	createChatTagging: jest.fn(),
	deleteChatTagging: jest.fn(),
}));
import { createChatTagging } from '@src/api/chatTaggingApi';

const existingTags = [{ id: 1, name: 'Existing', web_inbox_color: '#fff' }];

const mockDispatch = jest.fn();
jest.mock('@src/store/hooks', () => ({
	useAppSelector: jest.fn(() => existingTags),
	useAppDispatch: () => mockDispatch,
}));

describe('ChatTagsList - creating a tag from the filter dialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('creates the tag, adds it to the store, and does NOT assign it to any chat', async () => {
		const createdTag = { id: 99, name: 'New', web_inbox_color: '#607d8b' };
		(createTag as jest.Mock).mockResolvedValue(createdTag);

		render(<ChatTagsList open={true} setOpen={jest.fn()} />);

		// Reveal the input.
		fireEvent.click(screen.getByText('Create new tag'));

		fireEvent.change(screen.getByPlaceholderText('Tag name'), {
			target: { value: '  New  ' },
		});

		fireEvent.click(screen.getByLabelText('Save'));

		await waitFor(() =>
			expect(createTag).toHaveBeenCalledWith({
				name: 'New',
				web_inbox_color: expect.any(String),
			})
		);

		// The new tag is appended to the existing store list.
		await waitFor(() =>
			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'tags/setTags',
					payload: [...existingTags, createdTag],
				})
			)
		);

		// Crucially, no chat tagging happened.
		expect(createChatTagging).not.toHaveBeenCalled();
	});
});
