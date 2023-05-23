import APICallProps from '@src/api/APICallProps';
import { useContext, useState } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { CancelToken } from 'axios';
import GroupsResponse, { GroupList } from '@src/api/responses/GroupsResponse';

const useGroupsAPI = () => {
	// @ts-ignore
	const { apiService } = useContext(ApplicationContext);

	const [groups, setGroups] = useState<GroupList>({});

	const listGroups = async (apiCallProps: APICallProps) => {
		apiService.listGroupsCall(
			apiCallProps.cancelToken,
			apiCallProps.onSuccess,
			apiCallProps.onError
		);
	};

	const initGroups = async (cancelToken?: CancelToken) => {
		await listGroups({
			cancelToken: cancelToken,
			onSuccess: (response) => {
				const groupsResponse = new GroupsResponse(response.data);
				setGroups(groupsResponse.groups);
			},
		});
	};

	return {
		groups,
		initGroups,
		listGroups,
	};
};

export default useGroupsAPI;
