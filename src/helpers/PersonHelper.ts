import { Person } from '@src/types/persons';
import { getPastHoursByTimestamp } from '@src/helpers/DateHelper';

export const isPersonExpired = (person: Person | undefined) => {
	if (!person) return true;
	return getPastHoursByTimestamp(person.last_message_timestamp) >= 24;
};
