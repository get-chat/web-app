import React, { useEffect, useRef } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import TemplatesResponse from '@src/api/responses/TemplatesResponse';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { useDispatch } from 'react-redux';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { setIsRefreshingTemplates } from '@src/store/reducers/isRefreshingTemplatesReducer';
import { AXIOS_ERROR_CODE_TIMEOUT } from '@src/Constants';

const MAX_RETRY = 15;
const RETRY_DELAY = 1000;

const useTemplates = () => {
	// noinspection JSCheckFunctionSignatures
	const { apiService } = React.useContext(ApplicationContext);

	const dispatch = useDispatch();

	const retryCount = useRef(0);

	const cancelTokenSourceRef = useRef();

	useEffect(() => {
		cancelTokenSourceRef.current = generateCancelToken();

		return () => {
			// Cancelling ongoing requests
			cancelTokenSourceRef.current.cancel();
		};
	}, []);

	const issueTemplateRefreshRequest = async () => {
		dispatch(setIsRefreshingTemplates(true));

		await apiService.issueTemplateRefreshRequestCall(
			cancelTokenSourceRef.current.token,
			() => {
				checkTemplateRefreshStatus();

				console.log('Issued a template refresh request.');
			},
			(error) => {
				console.log(error);

				console.log('Failed to issue a template refresh request.');
				dispatch(setIsRefreshingTemplates(false));

				window.displayCustomError(
					'Failed to issue a template refresh request. Please try again in a while.'
				);
			}
		);
	};

	const checkTemplateRefreshStatus = async () => {
		console.log('Checking template refresh status...');

		const errorCallback = () => {
			if (retryCount.current < MAX_RETRY) {
				retryCount.current = retryCount.current + 1;

				console.log(
					'Retrying, attempt: ' + retryCount.current + '/' + MAX_RETRY
				);

				setTimeout(() => {
					checkTemplateRefreshStatus();
				}, RETRY_DELAY);
			} else {
				console.log('Too many attempts to refresh templates!');
				dispatch(setIsRefreshingTemplates(false));

				window.displayCustomError(
					'Too many attempts to refresh templates! Please try again in a while.'
				);
			}
		};

		await apiService.checkTemplateRefreshStatusCall(
			cancelTokenSourceRef.current.token,
			(response) => {
				// noinspection JSUnresolvedVariable
				if (response.data?.currently_refreshing === false) {
					console.log('Templates are ready to be loaded.');

					retryCount.current = 0;
					listTemplates(true);
				} else {
					console.log('Templates are still being refreshed.');
					errorCallback();
				}
			},
			(error) => {
				console.log(error);

				if (
					error.code === AXIOS_ERROR_CODE_TIMEOUT ||
					error.response?.status === 504
				) {
					errorCallback();
				} else {
					dispatch(setIsRefreshingTemplates(false));
				}
			}
		);
	};

	const listTemplates = async (displaySuccessOnUI) => {
		await apiService.listTemplatesCall(
			cancelTokenSourceRef.current.token,
			(response) => {
				console.log('Loaded templates successfully!');

				const templatesResponse = new TemplatesResponse(response.data);
				dispatch(setTemplates(templatesResponse.templates));
				dispatch(setIsRefreshingTemplates(false));

				if (displaySuccessOnUI) {
					window.displaySuccess('Templates are refreshed successfully.');
				}
			},
			(error) => {
				console.log(error);
				console.log('Failed to load templates.');
				dispatch(setIsRefreshingTemplates(false));

				window.displayCustomError(
					'Failed to load templates. Please try again in a while.'
				);
			}
		);
	};

	return {
		issueTemplateRefreshRequest,
		listTemplates,
	};
};

export default useTemplates;
