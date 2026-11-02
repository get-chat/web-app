import {
	applyContactSavedNamesToProviders,
	INBOX_CONTACT_PROVIDER_ID,
} from '@src/helpers/ContactProvidersHelper';

/**
 * The inbox's own contacts are part of contact providers data, and their name
 * outranks the chat's, so a `contact_saved_name` event has to reach them too.
 */
describe('applyContactSavedNamesToProviders', () => {
	const inboxContact = {
		name: 'Jane van der Berg',
		initials: 'JVD',
		contact_provider: { type: 'other', id: INBOX_CONTACT_PROVIDER_ID },
	};
	const hubspotContact = {
		name: 'Jane (HubSpot)',
		contact_provider: { type: 'hubspot', id: 'abc' },
	};
	const data = { '905383192532': [inboxContact, hubspotContact] };

	it("renames the inbox's own contact and leaves external providers alone", () => {
		const next = applyContactSavedNamesToProviders(data, [
			{
				wa_id: '905383192532',
				saved_name: null,
				name: 'Pablo M.',
				initials: 'PM',
			},
		]);

		expect(next['905383192532']).toEqual([
			{ ...inboxContact, name: 'Pablo M.', initials: 'PM' },
			hubspotContact,
		]);
	});

	it('returns the data itself when no contact in it changed', () => {
		expect(
			applyContactSavedNamesToProviders(data, [
				{
					wa_id: '491711234567',
					saved_name: 'Konrad Weber',
					name: 'Konrad Weber',
					initials: 'KW',
				},
			])
		).toBe(data);
	});
});
