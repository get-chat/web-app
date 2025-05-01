import { useEffect, useRef, useState } from 'react';
import { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { CONTACTS_TEMP_LIMIT } from '@src/Constants';
import { fetchContacts } from '@src/api/contactsApi';
import { Contact } from '@src/types/contacts';
import { fetchPersons } from '@src/api/personsApi';
import { PersonList, Recipient } from '@src/types/persons';
import { generateInitialsHelper } from '@src/helpers/Helpers';

const useContacts = () => {
	const [keyword, setKeyword] = useState('');
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [persons, setPersons] = useState<PersonList>({});
	const [unifiedList, setUnifiedList] = useState<Recipient[]>([]);
	const [isLoading, setLoading] = useState(false);

	let cancelTokenSourceRef = useRef<CancelTokenSource>();

	let timeout = useRef<NodeJS.Timeout>();

	useEffect(() => {
		return () => {
			cancelTokenSourceRef.current?.cancel();
		};
	}, []);

	useEffect(() => {
		const contactsAsRecipients: Recipient[] = contacts.map(
			(item) =>
				({
					name: item.name,
					initials: item.initials,
					avatar: item.avatar,
					phone_numbers: item.phone_numbers,
					provider: item.contact_provider?.name,
				} as Recipient)
		);

		const personsAsRecipients: Recipient[] = Object.values(persons).map(
			(item) =>
				({
					name: item.waba_payload?.profile?.name,
					initials: generateInitialsHelper(item.waba_payload?.profile?.name),
					phone_numbers: [
						{
							phone_number: item.wa_id,
						},
					],
					provider: 'whatsapp',
				} as Recipient)
		);

		// Creating a unified list and sorting alphabetically
		setUnifiedList(
			[...contactsAsRecipients, ...personsAsRecipients].sort(function (a, b) {
				return (
					a.name?.toLowerCase()?.localeCompare(b.name?.toLowerCase() ?? '') ??
					-1
				);
			})
		);
	}, [contacts, persons]);

	useEffect(() => {
		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		setLoading(true);

		timeout.current = setTimeout(function () {
			// Clear contacts and persons
			setContacts([]);
			setPersons({});

			// Load persons
			listPersons();
		}, 500);

		return () => {
			cancelTokenSourceRef.current?.cancel();
			clearTimeout(timeout.current);
			setLoading(false);
		};
	}, [keyword]);

	const listPersons = async () => {
		try {
			// TODO: Make request cancellable
			const data = await fetchPersons({
				search: keyword?.trim(),
			});
			const personList: PersonList = {};
			data.results.forEach((personData: any, personIndex: number) => {
				personList[personIndex.toString()] = personData;
			});
			setPersons(personList);
			await listContacts();
		} catch (error: any | AxiosError) {
			console.error(error);
			setLoading(false);
		}
	};

	const listContacts = async () => {
		try {
			const data = await fetchContacts({
				search: keyword?.trim(),
				limit: CONTACTS_TEMP_LIMIT,
			});
			setContacts(data.results);
		} catch (error: any | AxiosResponse) {
			console.error(error);
			setLoading(false);
		}
	};

	return {
		keyword,
		setKeyword,
		isLoading,
		unifiedList,
	};
};

export default useContacts;
