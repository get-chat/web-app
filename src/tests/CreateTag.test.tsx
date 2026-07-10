import { renderHook, act, waitFor } from '@testing-library/react';
import useTags from '@src/hooks/useTags';
import { createTag, fetchTags } from '@src/api/tagsApi';
import { fetchChat } from '@src/api/chatsApi';
import { createChatTagging } from '@src/api/chatTaggingApi';

jest.mock('@src/api/tagsApi', () => ({
	fetchTags: jest.fn(),
	createTag: jest.fn(),
}));

jest.mock('@src/api/chatsApi', () => ({
	fetchChat: jest.fn(),
}));

jest.mock('@src/api/chatTaggingApi', () => ({
	createChatTagging: jest.fn(),
	deleteChatTagging: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('@src/store/hooks', () => ({
	useAppSelector: jest.fn(() => '123'),
	useAppDispatch: () => mockDispatch,
}));

const WA_ID = '123';

describe('useTags - creating a tag from the inbox', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetchChat as jest.Mock).mockResolvedValue({ tags: [] });
		(fetchTags as jest.Mock).mockResolvedValue({ results: [] });
	});

	it('creates the tag and assigns it to the current chat', async () => {
		const createdTag = {
			id: 42,
			name: 'VIP',
			web_inbox_color: '#607d8b',
		};
		(createTag as jest.Mock).mockResolvedValue(createdTag);
		(createChatTagging as jest.Mock).mockResolvedValue({ id: 7 });

		const { result } = renderHook(() =>
			useTags({ loadInitially: true, waId: WA_ID })
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await act(async () => {
			await result.current.doCreateTag('  VIP  ');
		});

		// The tag is created with a trimmed name and a default inbox color.
		expect(createTag).toHaveBeenCalledWith({
			name: 'VIP',
			web_inbox_color: expect.any(String),
		});

		// The freshly created tag is immediately assigned to this chat.
		expect(createChatTagging).toHaveBeenCalledWith({
			tag: createdTag.id,
			chat: WA_ID,
		});

		// It shows up in the chat's current tags.
		expect(result.current.chatTags).toEqual([
			expect.objectContaining({ id: 42, name: 'VIP', tagging_id: 7 }),
		]);
	});

	it('does not call the API for an empty tag name', async () => {
		const { result } = renderHook(() =>
			useTags({ loadInitially: true, waId: WA_ID })
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await act(async () => {
			await result.current.doCreateTag('   ');
		});

		expect(createTag).not.toHaveBeenCalled();
		expect(createChatTagging).not.toHaveBeenCalled();
	});
});
