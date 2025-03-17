import APICallProps from '@src/api/APICallProps';
import { useState } from 'react';
import { AxiosError, CancelToken } from 'axios';
import { Group, GroupList } from '@src/types/groups';
import { fetchGroups } from '@src/api/groupsApi';
import { PaginatedResponse } from '@src/types/common';

const useGroupsAPI = () => {
	const [groups, setGroups] = useState<GroupList>({});

	const listGroups = async (apiCallProps: APICallProps) => {
		try {
			const data = await fetchGroups();
			apiCallProps.onSuccess?.(data);
		} catch (error: any | AxiosError) {
			apiCallProps.onError?.(error);
		}
	};

	const initGroups = async (cancelToken?: CancelToken) => {
		await listGroups({
			cancelToken: cancelToken,
			onSuccess: (response: any) => {
				const preparedGroups: GroupList = {};
				(response as PaginatedResponse<Group>).results.forEach(
					(item) => (preparedGroups[item.id] = item)
				);
				setGroups(preparedGroups);
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
