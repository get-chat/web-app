import React, { useEffect, useRef, useState } from 'react';
import PersonsResponse, {
	PersonList,
} from '@src/api/responses/PersonsResponse';
import Recipient from '@src/interfaces/Recipient';
import { AxiosResponse, CancelTokenSource } from 'axios';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { CONTACTS_TEMP_LIMIT } from '@src/Constants';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { fetchContacts } from '@src/api/contactsApi';
import { Contact } from '@src/types/contacts';

const useContacts = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const [keyword, setKeyword] = useState('');
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [persons, setPersons] = useState<PersonList>({});
	const [unifiedList, setUnifiedList] = useState<(Recipient | Contact)[]>([]);
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

	const listContacts = async () => {
		try {
			const data = await fetchContacts({
				search: keyword?.trim(),
				limit: CONTACTS_TEMP_LIMIT,
			});
			setContacts(data.results);
		} catch (error: any | AxiosResponse) {
			console.error(error);
		} finally {
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
