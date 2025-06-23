import {
	BusinessProfileSettings,
	CheckSettingsRefreshStatusResponse,
	PartialUpdateBusinessProfileSettings,
	ProfileAboutResponse,
	UpdateProfileAboutRequest,
} from '@src/types/settings';
import api from '@src/api/axiosInstance';

export const fetchBusinessProfileSettings = async (signal?: AbortSignal) => {
	const response = await api.get<BusinessProfileSettings>(
		'/settings/business/profile/',
		{ signal }
	);
	return response.data;
};

export const partialUpdateBusinessProfileSettings = async (
	data: PartialUpdateBusinessProfileSettings,
	signal?: AbortSignal
) => {
	const response = await api.patch<BusinessProfileSettings>(
		'/settings/business/profile/',
		data,
		{ signal }
	);
	return response.data;
};

export const fetchProfileAbout = async () => {
	const response = await api.get<ProfileAboutResponse>(
		'/settings/profile/about/'
	);
	return response.data;
};

export const updateProfileAbout = async (
	data: UpdateProfileAboutRequest,
	signal?: AbortSignal
) => {
	const response = await api.patch<ProfileAboutResponse>(
		'/settings/profile/about/',
		data,
		{
			signal,
		}
	);
	return response.data;
};

export const fetchProfilePhoto = async (signal?: AbortSignal) => {
	const response = await api.get<ArrayBuffer>('/settings/profile/photo/', {
		responseType: 'arraybuffer',
		signal,
	});
	return response.data;
};

export const updateProfilePhoto = async (
	formData: FormData,
	signal?: AbortSignal
) => {
	return await api.post('/settings/profile/photo/', formData, {
		signal,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
};

export const issueSettingsRefreshRequest = async (signal?: AbortSignal) => {
	const response = await api.post('/settings/refresh/issue/', {
		signal,
	});
	return response.data;
};

export const checkSettingsRefreshStatus = async (signal?: AbortSignal) => {
	const response = await api.get<CheckSettingsRefreshStatusResponse>(
		'/settings/refresh/status/',
		{
			signal,
		}
	);
	return response.data;
};

export const deleteProfilePhoto = async (signal?: AbortSignal) => {
	return await api.delete('/settings/profile/photo/', { signal });
};
