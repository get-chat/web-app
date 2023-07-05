import React, { useState } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosError, AxiosResponse } from 'axios';
import { getContactProvidersData } from '@src/helpers/StorageHelper';

const useResolveContacts = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const [contactProvidersData, setContactProvidersData] = useState<any>(
		getContactProvidersData()
	);

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
