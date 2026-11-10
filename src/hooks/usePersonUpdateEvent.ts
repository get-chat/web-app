import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import PubSub from 'pubsub-js';
import { Person } from '@src/types/persons';

/**
 * Keeps the person a chat view holds up to date with a WebSocket event about
 * contacts (`[{wa_id, ...}]`, published on `topic`), live.
 *
 * While the person is loading, the response may predate an event that arrives
 * meanwhile. Call `resetPending()` right before requesting the person and pass
 * the response through `applyPending()`: only events received since the
 * request started are applied to it, so a refresh never rolls the person back
 * to an older event the response already supersedes.
 */
const usePersonUpdateEvent = <U extends { wa_id: string }>(
	topic: string,
	waId: string | undefined,
	setPerson: Dispatch<SetStateAction<Person | undefined>>,
	apply: (person: Person, updates: U[]) => Person
) => {
	// The last event about this chat since the person was last requested
	const pendingRef = useRef<U[]>([]);

	useEffect(() => {
		const onEvent = function (msg: string, data: U[]) {
			if (data.some((item) => item.wa_id === waId)) {
				pendingRef.current = data;
			}
			setPerson((prevState) =>
				prevState ? apply(prevState, data) : prevState
			);
		};

		const eventToken = PubSub.subscribe(topic, onEvent);

		return () => {
			pendingRef.current = [];
			PubSub.unsubscribe(eventToken);
		};
	}, [topic, waId]);

	return {
		resetPending: () => {
			pendingRef.current = [];
		},
		applyPending: (person: Person) => apply(person, pendingRef.current),
	};
};

export default usePersonUpdateEvent;
