import React, { useRef } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import TemplatesResponse from '@src/api/responses/TemplatesResponse';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { useDispatch } from 'react-redux';

const MAX_RETRY = 15;
const RETRY_DELAY = 2000;

const useTemplates = () => {
	// noinspection JSCheckFunctionSignatures
	const { apiService } = React.useContext(ApplicationContext);

	const dispatch = useDispatch();

	const retryCount = useRef(0);

	const issueTemplateRefreshRequest = async () => {
		await apiService.issueTemplateRefreshRequestCall(
			undefined,
			() => {
				checkTemplateRefreshStatus();

				console.log('Issued a template refresh request.');
			},
			(error) => {
				console.log(error);

				console.log('Failed to issue a template refresh request.');
			}
		);
	};

	const checkTemplateRefreshStatus = async () => {
		console.log('Checking template refresh status');

		await apiService.checkTemplateRefreshStatusCall(
			undefined,
			(response) => {
				// noinspection JSUnresolvedVariable
				if (response.data?.currently_refreshing === false) {
					console.log('Templates are ready to be loaded!');

					retryCount.current = 0;
					listTemplates(true);
				} else {
					console.log('Templates are still being refreshed!');

					setTimeout(() => {
						if (retryCount.current < MAX_RETRY) {
							console.log('Retrying...');

							retryCount.current = retryCount.current + 1;
							checkTemplateRefreshStatus();
						} else {
							console.log('Too many attempts to refresh templates!');
						}
					}, RETRY_DELAY);
				}
			},
			(error) => {
				console.log(error);
			}
		);
	};

	const listTemplates = async (displaySuccessOnUI) => {
		await apiService.listTemplatesCall(
			(response) => {
				const templatesResponse = new TemplatesResponse(response.data);
				dispatch(setTemplates(templatesResponse.templates));

				if (displaySuccessOnUI) {
					window.displaySuccess('Templates are refreshed successfully!');
				}
			},
			(error) => {
				console.log(error);
			}
		);
	};

	return {
		issueTemplateRefreshRequest,
		listTemplates,
	};
};

export default useTemplates;
