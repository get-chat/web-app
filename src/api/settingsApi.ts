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
	params: PartialUpdateBusinessProfileSettings
) => {
	const response = await axios.patch<BusinessProfileSettings>(
		'/settings/business/profile/',
		{ params }
	);
	return response.data;
};

export const fetchProfileAbout = async () => {
	const response = await axios.get<ProfileAboutResponse>(
		'/settings/profile/about/'
	);
	return response.data;
};

export const updateProfileAbout = async (params: UpdateProfileAboutRequest) => {
	const response = await axios.patch<ProfileAboutResponse>(
		'/settings/profile/about/',
		{ params }
	);
	return response.data;
};
