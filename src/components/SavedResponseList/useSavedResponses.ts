import { setSavedResponses } from '@src/store/reducers/savedResponsesReducer';
import { useAppDispatch } from '@src/store/hooks';
import {
	deleteSavedResponse,
	fetchSavedResponses,
} from '@src/api/savedResponsesApi';

const useSavedResponses = () => {
	const dispatch = useAppDispatch();

	const handleFetchSavedResponses = async () => {
		try {
			const data = await fetchSavedResponses();
			dispatch(setSavedResponses(data.results));
		} catch (error) {
			console.error('Failed to fetch responses:', error);
		}
	};

	const handleDeleteSavedResponse = async (id: number) => {
		try {
			await deleteSavedResponse(id);
			window.displaySuccess('Deleted response successfully!');
			await handleFetchSavedResponses();
		} catch (error) {
			console.error(error);
		}
	};

	return {
		listSavedResponses: handleFetchSavedResponses,
		deleteSavedResponse: handleDeleteSavedResponse,
	};
};

export default useSavedResponses;
