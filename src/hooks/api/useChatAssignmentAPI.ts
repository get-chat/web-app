import React from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosError, AxiosResponse } from 'axios';
import APICallProps from '@src/api/APICallProps';
import { fetchChatAssignment } from '@src/api/chatAssignmentApi';

const useChatAssignmentAPI = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const retrieveChatAssignment = async (
		waId: string,
		apiCallProps: APICallProps
	) => {
		try {
			const data = fetchChatAssignment(waId);
			apiCallProps.onSuccess?.(data);
		} catch (error: any | AxiosError) {
			console.error(error);
			apiCallProps.onError?.(error);
		}
	};

	const partialUpdateChatAssignment = (
		waId?: string | null,
		assignedToUser?: number | null,
		assignedGroup?: number | null,
		apiCallProps?: APICallProps
	) => {
		console.log('Partially updating chat assignment...');

		apiService.partialUpdateChatAssignmentCall(
			waId,
			assignedToUser,
			assignedGroup,
			apiCallProps?.cancelToken,
			(response: AxiosResponse) => {
				console.log(response.data);

				apiCallProps?.onSuccess?.(response);
			},
			(error: AxiosError) => {
				if (error?.response?.status === 403) {
					// @ts-ignore
					window.displayError(error);
				}

				apiCallProps?.onError?.(error);
			}
		);
	};

	return {
		retrieveChatAssignment,
		partialUpdateChatAssignment,
	};
};

export default useChatAssignmentAPI;
