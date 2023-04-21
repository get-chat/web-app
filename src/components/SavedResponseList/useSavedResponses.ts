import React from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosResponse } from 'axios';
import SavedResponsesResponse from '@src/api/responses/SavedResponsesResponse';
import { setSavedResponses } from '@src/store/reducers/savedResponsesReducer';
import { useAppDispatch } from '@src/store/hooks';

const useSavedResponses = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const dispatch = useAppDispatch();

	const listSavedResponses = async () => {
		await apiService.listSavedResponsesCall((response: AxiosResponse) => {
			const savedResponsesResponse = new SavedResponsesResponse(response.data);

			// Store
			dispatch(setSavedResponses(savedResponsesResponse.savedResponses));
		});
	};

	const deleteSavedResponse = async (id: Number) => {
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
