import APICallProps from '@src/api/APICallProps';
import { useContext } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';

const useGroupsAPI = () => {
	// @ts-ignore
	const { apiService } = useContext(ApplicationContext);

	const listGroups = async (params: APICallProps) => {
		apiService.listGroupsCall(
			params.cancelToken,
			params.onSuccess,
			params.onError
		);
	};

	return {
		listGroups,
	};
};

export default useGroupsAPI;
