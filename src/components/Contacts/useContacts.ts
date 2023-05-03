import React, { useEffect, useRef, useState } from 'react';
import ContactModel from '@src/api/models/ContactModel';
import PersonsResponse, {
	PersonList,
} from '@src/api/responses/PersonsResponse';
import Recipient from '@src/api/models/interfaces/Recipient';
import { AxiosResponse, CancelTokenSource } from 'axios';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { CONTACTS_TEMP_LIMIT } from '@src/Constants';
import ContactsResponse from '@src/api/responses/ContactsResponse';
import { ApplicationContext } from '@src/contexts/ApplicationContext';

const useContacts = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const [keyword, setKeyword] = useState('');
	const [contacts, setContacts] = useState<ContactModel[]>([]);
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
		// Creating a unified list and sorting alphabetically
		setUnifiedList(
			[...Object.values(persons), ...contacts].sort(function (
				a: Recipient,
				b: Recipient
			) {
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

	const listPersons = () => {
		apiService.listPersonsCall(
			keyword?.trim(),
			cancelTokenSourceRef.current?.token,
			(response: AxiosResponse) => {
				const personsResponse = new PersonsResponse(response.data);
				setPersons(personsResponse.persons);
				listContacts();
			},
			() => {
				setLoading(false);
			}
		);
	};

	const listContacts = () => {
		apiService.listContactsCall(
			keyword?.trim(),
			CONTACTS_TEMP_LIMIT,
			undefined,
			cancelTokenSourceRef.current?.token,
			(response: AxiosResponse) => {
				const contactsResponse = new ContactsResponse(response.data);
				setContacts(contactsResponse.contacts);
				setLoading(false);
			},
			() => {
				setLoading(false);
			}
		);
	};

	return {
		keyword,
		setKeyword,
		isLoading,
		unifiedList,
	};
};

export default useContacts;
