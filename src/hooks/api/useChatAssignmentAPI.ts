import React from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosError, AxiosResponse } from 'axios';
import APICallProps from '@src/api/APICallProps';

const useChatAssignmentAPI = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const retrieveChatAssignment = (waId: string, apiCallProps: APICallProps) => {
		apiService.retrieveChatAssignmentCall(
			waId,
			(response: AxiosResponse) => {
				apiCallProps.onSuccess?.(response);
			},
			(error: AxiosError) => {
				apiCallProps.onError?.(error);
			}
		);
	};

	const partialUpdateChatAssignment = (
		waId: string,
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
					window.displayCustomError(error?.response?.data?.detail);
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
