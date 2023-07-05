import React, { useEffect, useRef, useState } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosError, AxiosResponse } from 'axios';
import {
	getContactProvidersData,
	storeContactProvidersData,
} from '@src/helpers/StorageHelper';
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

	const isRequesting = useRef(false);

	useEffect(() => {
		for (let chat of Object.values(chats)) {
			if (chat.waId && !contactProvidersData[chat.waId]) {
				if (checkedWaIds.includes(chat.waId)) {
					continue;
				} else {
					checkedWaIds.push(chat.waId);
				}

				setMissingContactWaIds((prevState) => {
					prevState.push(chat.waId);
					return [...prevState];
				});
			}
		}
	}, [chats, contactProvidersData, checkedWaIds, missingContactWaIds]);

	useEffect(() => {
		if (missingContactWaIds.length && !isRequesting.current) {
			const targetWaId = missingContactWaIds[0];

			isRequesting.current = true;
			resolveContact(targetWaId, () => {
				setMissingContactWaIds((prevState) => [
					...prevState.filter((item) => item !== targetWaId),
				]);
				isRequesting.current = false;
			});
		}
	}, [missingContactWaIds]);

	// Store contact providers data in local storage
	useEffect(() => {
		storeContactProvidersData(contactProvidersData);
	}, [contactProvidersData]);

	const resolveContact = (personWaId: string, onComplete?: () => void) => {
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

				onComplete?.();
			},
			(error: AxiosError) => {
				if (error.response?.status === 404) {
					console.log('Contact is not found.');
				} else {
					console.log(error.response);
				}

				onComplete?.();
			}
		);
	};

	return { resolveContact, contactProvidersData, setContactProvidersData };
};

export default useResolveContacts;
