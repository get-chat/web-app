import React from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { AxiosError, AxiosResponse } from 'axios';

const useChatAssignment = () => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);

	const retrieveChatAssignment = (
		waId: string,
		onSuccess?: (response: AxiosResponse) => void,
		onError?: (error: AxiosError) => void
	) => {
		apiService.retrieveChatAssignmentCall(
			waId,
			(response: AxiosResponse) => {
				onSuccess?.(response);
			},
			(error: AxiosError) => {
				onError?.(error);
			}
		);
	};

	const partialUpdateChatAssignment = (
		waId: string,
		assignedToUser?: Number,
		assignedGroup?: Number
	) => {
		console.log('Partially updating chat assignment...');

		apiService.partialUpdateChatAssignmentCall(
			waId,
			assignedToUser,
			assignedGroup,
			(response: AxiosResponse) => {
				console.log(response.data);
			},
			(error: AxiosError) => {
				if (error?.response?.status === 403) {
					// @ts-ignore
					window.displayError(
						'This chat could not be assigned as its assignments have been changed by another user recently.'
					);
				}
			}
		);
	};

	return {
		retrieveChatAssignment,
		partialUpdateChatAssignment,
	};
};

export default useChatAssignment;
