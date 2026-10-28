import api from '@src/api/axiosInstance';
import { Branding } from '@src/types/branding';

// Answered before login too: with no token, the instance's branding
export const fetchBranding = async () => {
	const response = await api.get<Branding>('/branding/');
	return response.data;
};
