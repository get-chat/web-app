import chatsReducer, {
	setChatSavedNames,
} from '@src/store/reducers/chatsReducer';
import { Chat } from '@src/types/chats';

/**
 * `contact_saved_name` WebSocket events: the WhatsApp Business app address
 * book (Coexistence) renamed chats, and the chat list follows live.
 */

const buildChat = (waId: string): Chat =>
	({
		wa_id: waId,
		contact: {
			wa_id: waId,
			waba_payload: { profile: { name: 'Pablo M.' }, wa_id: waId },
			saved_name: null,
			initials: 'PM',
		},
		tags: [],
	} as unknown as Chat);

const initialState = () => ({
	value: { chat_905383192532: buildChat('905383192532') },
});

describe('setChatSavedNames', () => {
	it('applies the saved name and the initials the API recomputed', () => {
		const state = chatsReducer(
			initialState(),
			setChatSavedNames([
				{
					wa_id: '905383192532',
					saved_name: 'Jane van der Berg',
					name: 'Jane van der Berg',
					initials: 'JVD',
				},
			])
		);

		expect(state.value.chat_905383192532.contact.saved_name).toBe(
			'Jane van der Berg'
		);
		expect(state.value.chat_905383192532.contact.initials).toBe('JVD');
	});

	it('clears the saved name when the business removed the entry', () => {
		const renamed = chatsReducer(
			initialState(),
			setChatSavedNames([
				{
					wa_id: '905383192532',
					saved_name: 'Jane',
					name: 'Jane',
					initials: 'J',
				},
			])
		);

		const state = chatsReducer(
			renamed,
			setChatSavedNames([
				{
					wa_id: '905383192532',
					saved_name: null,
					name: 'Pablo M.',
					initials: 'PM',
				},
			])
		);

		expect(state.value.chat_905383192532.contact.saved_name).toBeNull();
		expect(state.value.chat_905383192532.contact.initials).toBe('PM');
	});

	it('leaves the state untouched for chats that are not loaded', () => {
		const before = initialState();

		const state = chatsReducer(
			before,
			setChatSavedNames([
				{
					wa_id: '491711234567',
					saved_name: 'Other',
					name: 'Other',
					initials: 'O',
				},
			])
		);

		expect(state).toBe(before);
	});
});
