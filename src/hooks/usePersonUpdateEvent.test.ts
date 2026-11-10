import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import PubSub from 'pubsub-js';
import usePersonUpdateEvent from '@src/hooks/usePersonUpdateEvent';
import { applyContactMarketingPreference } from '@src/helpers/PersonHelper';
import { ContactMarketingPreference, Person } from '@src/types/persons';

// The real bus: subscribing and publishing are what is under test
jest.unmock('pubsub-js');

/**
 * Person updates from WebSocket events (`contact_marketing_preference` here):
 * applied live, and to a person response that may predate them, but never
 * replayed over a later response that already reflects them.
 */

const TOPIC = 'test_contact_marketing_preference';
const WA_ID = '905383192532';

const buildPerson = (marketingOptOut: boolean): Person =>
	({
		wa_id: WA_ID,
		waba_payload: { wa_id: WA_ID },
		initials: '',
		last_message_timestamp: 0,
		resolved: false,
		marketing_opt_out: marketingOptOut,
	} as Person);

const publish = (marketingOptOut: boolean, waId = WA_ID) =>
	act(() => {
		PubSub.publishSync(TOPIC, [
			{ wa_id: waId, marketing_opt_out: marketingOptOut },
		]);
	});

const renderPersonHook = (initialPerson?: Person) =>
	renderHook(() => {
		const [person, setPerson] = useState<Person | undefined>(initialPerson);
		const events = usePersonUpdateEvent<ContactMarketingPreference>(
			TOPIC,
			WA_ID,
			setPerson,
			applyContactMarketingPreference
		);
		return { person, events };
	});

afterEach(() => {
	PubSub.clearAllSubscriptions();
});

describe('usePersonUpdateEvent', () => {
	it('applies events to the loaded person live', () => {
		const { result } = renderPersonHook(buildPerson(false));

		publish(true);
		expect(result.current.person?.marketing_opt_out).toBe(true);

		publish(false);
		expect(result.current.person?.marketing_opt_out).toBe(false);
	});

	it('ignores events about other chats', () => {
		const { result } = renderPersonHook(buildPerson(false));

		publish(true, '491711234567');

		expect(result.current.person?.marketing_opt_out).toBe(false);
		expect(
			result.current.events.applyPending(buildPerson(false)).marketing_opt_out
		).toBe(false);
	});

	it('applies an event received while the person loads to the response', () => {
		const { result } = renderPersonHook();

		result.current.events.resetPending();
		publish(true);

		expect(
			result.current.events.applyPending(buildPerson(false)).marketing_opt_out
		).toBe(true);
	});

	it('does not replay an older event over a later refresh', () => {
		const { result } = renderPersonHook(buildPerson(false));

		// A stop arrives, then a resume is missed (e.g. while offline)
		publish(true);

		// The refresh's response already reflects both
		result.current.events.resetPending();
		expect(
			result.current.events.applyPending(buildPerson(false)).marketing_opt_out
		).toBe(false);
	});
});
