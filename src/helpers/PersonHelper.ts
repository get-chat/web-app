import { ContactSavedName, Person, PersonList } from '@src/types/persons';
import { getUnixTimestamp } from '@src/helpers/DateHelper';

/**
 * The name to show for a contact: the one the business saved for it in the
 * WhatsApp Business app address book (Coexistence), else the contact's own
 * WhatsApp profile name.
 */
export const getPersonName = (person: Partial<Person> | undefined | null) =>
	person?.saved_name || person?.waba_payload?.profile?.name;

/**
 * Applies a `contact_saved_name` WebSocket event to a locally held contact: the
 * saved name and the `initials` the API recomputed for it. Returns the contact
 * itself when the event does not concern it.
 */
export const applyContactSavedName = <T extends Partial<Person>>(
	target: T,
	updates: ContactSavedName[]
): T => {
	const update = updates.find((item) => item.wa_id === target.wa_id);
	return update
		? { ...target, saved_name: update.saved_name, initials: update.initials }
		: target;
};

/**
 * applyContactSavedName() over a list, returning the list itself when no
 * contact in it changed so that holders do not re-render for nothing.
 */
export const applyContactSavedNames = (
	persons: PersonList,
	updates: ContactSavedName[]
): PersonList => {
	let isChanged = false;
	const nextPersons: PersonList = {};
	Object.entries(persons).forEach(([key, person]) => {
		nextPersons[key] = applyContactSavedName(person, updates);
		isChanged ||= nextPersons[key] !== person;
	});
	return isChanged ? nextPersons : persons;
};

/**
 * POSIX timestamp (seconds) after which a non-template message to this contact
 * is rejected with HTTP 453.
 *
 * The API computes it — from what Meta reported for the conversation, the
 * customer's last message as a floor, and an ad referral for Click-to-WhatsApp (CTWA)
 * chats — and always sends it. No duration is held on this side, so a policy
 * change needs no frontend release.
 */
export const getMessagingWindowExpiresAt = (person: Person | undefined) =>
	person?.messaging_window_expires_at;

export const isPersonExpired = (person: Person | undefined) => {
	const expiresAt = getMessagingWindowExpiresAt(person);

	// No contact, or a payload without the window: treat the chat as closed
	// rather than guessing a duration. Sending is what the backend arbitrates,
	// and it answers 453 in exactly this case.
	if (expiresAt === undefined) return true;

	// The backend rejects only once the window has passed, so the expiry second
	// itself is still sendable. Both sides deal in whole seconds.
	return expiresAt < Math.floor(getUnixTimestamp());
};

/**
 * Copies the messaging window from a contact payload the backend just sent
 * onto a locally held contact.
 *
 * An incoming message reopens the window, and the contact is not re-fetched
 * when one arrives — but it does not have to be: the serialized messages
 * delivered over the WebSocket embed the contact, so the
 * recomputed window travels with the message. Applying it is what keeps the
 * chat header, the composer and the list countdown correct live.
 *
 * A message that carries no contact at all (one derived from the Cloud API
 * envelope rather than serialized by the API) leaves the target untouched.
 */
export const mergeMessagingWindow = <T extends Partial<Person>>(
	target: T,
	source: Partial<Person> | undefined | null
): T => {
	if (!source || typeof source.messaging_window_expires_at !== 'number') {
		return target;
	}

	return {
		...target,
		messaging_window_expires_at: source.messaging_window_expires_at,
		messaging_window_origin: source.messaging_window_origin ?? null,
	};
};
