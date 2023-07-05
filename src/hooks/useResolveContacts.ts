import React, { useEffect, useState } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosError, AxiosResponse } from 'axios';
import { getContactProvidersData } from '@src/helpers/StorageHelper';
import { useAppSelector } from '@src/store/hooks';

const useResolveContacts = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const chats = useAppSelector((state) => state.chats.value);

	const [contactProvidersData, setContactProvidersData] = useState<{
		[key: string]: any;
	}>(getContactProvidersData());
	const [checkedWaIds, setCheckedWaIds] = useState<string[]>([]);
	const [missingContactWaIds, setMissingContactWaIds] = useState<string[]>([]);

	useEffect(() => {
		for (let chat of Object.values(chats)) {
			if (chat.waId && !contactProvidersData[chat.waId]) {
				if (checkedWaIds.includes(chat.waId)) {
					continue;
				} else {
					checkedWaIds.push(chat.waId);
				}

				missingContactWaIds.push(chat.waId);
				console.log('Missing: ' + chat.waId);
			}
		}
	}, [chats, contactProvidersData, checkedWaIds, missingContactWaIds]);

	useEffect(() => {
		// TODO: Handle resolving contacts
	}, [missingContactWaIds]);

	const resolveContact = (personWaId: string) => {
		if (contactProvidersData?.[personWaId] !== undefined) {
			// Already retrieved
			return;
		}

		if (!personWaId) {
			console.warn('Resolve contact: wa_id is undefined!');
			return;
		}

		console.log('Resolving contact: ' + personWaId);

		apiService.resolveContactCall(
			personWaId,
			(response: AxiosResponse) => {
				setContactProvidersData((prevState: any) => {
					prevState[personWaId] = response.data.contact_provider_results;
					return { ...prevState };
				});
			},
			(error: AxiosError) => {
				if (error.response?.status === 404) {
					console.log('Contact is not found.');
				} else {
					console.log(error.response);
				}
			}
		);
	};

	return { resolveContact, contactProvidersData, setContactProvidersData };
};

export default useResolveContacts;
