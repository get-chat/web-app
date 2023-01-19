import React from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import TemplatesResponse from '@src/api/responses/TemplatesResponse';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { useDispatch } from 'react-redux';

const useTemplates = () => {
	const { apiService } = React.useContext(ApplicationContext);

	const dispatch = useDispatch();

	const issueTemplateRefreshRequest = async () => {
		await apiService.issueTemplateRefreshRequestCall(
			undefined,
			(response) => {
				console.log(response.data);
			},
			(error) => {
				console.log(error);
			}
		);
	};

	const checkTemplateRefreshStatus = async () => {
		await apiService.checkTemplateRefreshStatusCall(
			undefined,
			(response) => {
				console.log(response.data);
			},
			(error) => {
				console.log(error);
			}
		);
	};

	const listTemplates = async () => {
		await apiService.listTemplatesCall(
			(response) => {
				const templatesResponse = new TemplatesResponse(response.data);
				dispatch(setTemplates(templatesResponse.templates));
			},
			(error) => {
				console.log(error);
			}
		);
	};
};

export default useTemplates;
