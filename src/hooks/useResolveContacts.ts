import { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import {
	getContactProvidersData,
	storeContactProvidersData,
} from '@src/helpers/StorageHelper';
import { useAppSelector } from '@src/store/hooks';
import { resolveContact } from '@src/api/contactsApi';

const useResolveContacts = () => {
	const chats = useAppSelector((state) => state.chats.value);

	const [contactProvidersData, setContactProvidersData] = useState<{
		[key: string]: any;
	}>(getContactProvidersData());
	const [checkedWaIds, setCheckedWaIds] = useState<string[]>([]);
	const [missingContactWaIds, setMissingContactWaIds] = useState<string[]>([]);

	const isRequesting = useRef(false);

	useEffect(() => {
		for (let chat of Object.values(chats)) {
			if (chat.wa_id && !contactProvidersData[chat.wa_id]) {
				if (checkedWaIds.includes(chat.wa_id)) {
					continue;
				} else {
					checkedWaIds.push(chat.wa_id);
				}

				setMissingContactWaIds((prevState) => {
					prevState.push(chat.wa_id);
					return [...prevState];
				});
			}
		}
	}, [chats, contactProvidersData, checkedWaIds, missingContactWaIds]);

	useEffect(() => {
		if (missingContactWaIds.length && !isRequesting.current) {
			const targetWaId = missingContactWaIds[0];

			isRequesting.current = true;
			doResolveContact(targetWaId, () => {
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

	const doResolveContact = async (
		personWaId: string,
		onComplete?: () => void
	) => {
		if (contactProvidersData?.[personWaId] !== undefined) {
			// Already retrieved
			return;
		}

		if (!personWaId) {
			console.warn('Resolve contact: wa_id is undefined!');
			return;
		}

		console.log('Resolving contact: ' + personWaId);

		try {
			const data = await resolveContact(personWaId);
			setContactProvidersData((prevState: any) => {
				prevState[personWaId] = data.contact_provider_results;
				return { ...prevState };
			});
		} catch (error: any | AxiosError) {
			if (error.response?.status === 404) {
				console.warn('Contact is not found.');
			} else {
				console.error(error.response);
			}
		} finally {
			onComplete?.();
		}
	};

	return {
		resolveContact: doResolveContact,
		contactProvidersData,
		setContactProvidersData,
	};
};

export default useResolveContacts;
