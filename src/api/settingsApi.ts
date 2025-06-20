import axios from '@src/api/axiosInstance';
import {
	BusinessProfileSettings,
	CheckSettingsRefreshStatusResponse,
	PartialUpdateBusinessProfileSettings,
	ProfileAboutResponse,
	UpdateProfileAboutRequest,
} from '@src/types/settings';

export const fetchBusinessProfileSettings = async (signal?: AbortSignal) => {
	const response = await axios.get<BusinessProfileSettings>(
		'/settings/business/profile/',
		{ signal }
	);
	return response.data;
};

export const partialUpdateBusinessProfileSettings = async (
	data: PartialUpdateBusinessProfileSettings,
	signal?: AbortSignal
) => {
	const response = await axios.patch<BusinessProfileSettings>(
		'/settings/business/profile/',
		data,
		{ signal }
	);
	return response.data;
};

export const fetchProfileAbout = async () => {
	const response = await axios.get<ProfileAboutResponse>(
		'/settings/profile/about/'
	);
	return response.data;
};

export const updateProfileAbout = async (
	data: UpdateProfileAboutRequest,
	signal?: AbortSignal
) => {
	const response = await axios.patch<ProfileAboutResponse>(
		'/settings/profile/about/',
		data,
		{
			signal,
		}
	);
	return response.data;
};

export const fetchProfilePhoto = async (signal?: AbortSignal) => {
	const response = await axios.get<ArrayBuffer>('/settings/profile/photo/', {
		responseType: 'arraybuffer',
		signal,
	});
	return response.data;
};

export const updateProfilePhoto = async (
	formData: FormData,
	signal?: AbortSignal
) => {
	return await axios.post('/settings/profile/photo/', formData, {
		signal,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
};

export const issueSettingsRefreshRequest = async (signal?: AbortSignal) => {
	return await axios.post('/settings/refresh/issue/', {
		signal,
	});
};

export const checkSettingsRefreshStatus = async (signal?: AbortSignal) => {
	return await axios.get<CheckSettingsRefreshStatusResponse>(
		'/settings/refresh/status/',
		{
			signal,
		}
	);
};

export const deleteProfilePhoto = async (signal?: AbortSignal) => {
	return await axios.delete('/settings/profile/photo/', { signal });
};
