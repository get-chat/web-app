import axios from '@src/api/axiosInstance';
import {
	BusinessProfileSettings,
	PartialUpdateBusinessProfileSettings,
	ProfileAboutResponse,
	UpdateProfileAboutRequest,
} from '@src/types/settings';

export const fetchBusinessProfileSettings = async () => {
	const response = await axios.get<BusinessProfileSettings>(
		'/settings/business/profile/'
	);
	return response.data;
};

export const partialUpdateBusinessProfileSettings = async (
	data: PartialUpdateBusinessProfileSettings
) => {
	const response = await axios.patch<BusinessProfileSettings>(
		'/settings/business/profile/',
		data
	);
	return response.data;
};

export const fetchProfileAbout = async () => {
	const response = await axios.get<ProfileAboutResponse>(
		'/settings/profile/about/'
	);
	return response.data;
};

export const updateProfileAbout = async (data: UpdateProfileAboutRequest) => {
	const response = await axios.patch<ProfileAboutResponse>(
		'/settings/profile/about/',
		data
	);
	return response.data;
};

export const fetchProfilePhoto = async () => {
	const response = await axios.get<ArrayBuffer>('/settings/profile/photo/', {
		responseType: 'arraybuffer',
	});
	return response.data;
};

export const updateProfilePhoto = async (formData: FormData) => {
	return await axios.post('/settings/profile/photo/', formData);
};

export const deleteProfilePhoto = async () => {
	return await axios.delete('/settings/profile/photo/');
};
