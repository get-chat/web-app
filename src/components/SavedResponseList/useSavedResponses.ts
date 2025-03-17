import React from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosResponse } from 'axios';
import SavedResponsesResponse from '@src/api/responses/SavedResponsesResponse';
import { setSavedResponses } from '@src/store/reducers/savedResponsesReducer';
import { useAppDispatch } from '@src/store/hooks';
import { fetchSavedResponses } from '@src/api/savedResponsesApi';
import savedResponsesResponse from '@src/api/responses/SavedResponsesResponse';

const useSavedResponses = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const dispatch = useAppDispatch();

	const listSavedResponses = async () => {
		try {
			const data = await fetchSavedResponses();
			dispatch(setSavedResponses(data.results));
		} catch (error) {
			console.error('Failed to fetch responses:', error);
		}
	};

	const deleteSavedResponse = async (id: number) => {
		await apiService.deleteSavedResponseCall(id, (response: AxiosResponse) => {
			console.log(response.data);

			// Display a success message
			// @ts-ignore
			window.displaySuccess('Deleted response successfully!');

			// Reload saved responses
			listSavedResponses();
		});
	};

	return {
		listSavedResponses,
		deleteSavedResponse,
	};
};

export default useSavedResponses;
