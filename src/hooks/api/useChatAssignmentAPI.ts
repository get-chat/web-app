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
		assignedToUser?: Number,
		assignedGroup?: Number,
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
					window.displayError(
						'This chat could not be assigned as its assignments have been changed by another user recently.'
					);
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
