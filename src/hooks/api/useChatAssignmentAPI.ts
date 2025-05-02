import { AxiosError } from 'axios';
import APICallProps from '@src/api/APICallProps';
import {
	fetchChatAssignment,
	partialUpdateChatAssignment,
} from '@src/api/chatAssignmentApi';

const useChatAssignmentAPI = () => {
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

	const doPartialUpdateChatAssignment = async (
		waId?: string | null,
		assignedToUser?: number | null,
		assignedGroup?: number | null,
		apiCallProps?: APICallProps
	) => {
		console.log('Partially updating chat assignment...');
		try {
			const data = partialUpdateChatAssignment({
				wa_id: waId ?? '',
				assigned_to_user: assignedToUser,
				assigned_group: assignedGroup,
			});
			apiCallProps?.onSuccess?.(data);
		} catch (error: any | AxiosError) {
			console.error(error);

			if (error?.response?.status === 403) {
				window.displayError(error);
			}
			apiCallProps?.onError?.(error);
		}
	};

	return {
		retrieveChatAssignment,
		partialUpdateChatAssignment: doPartialUpdateChatAssignment,
	};
};

export default useChatAssignmentAPI;
