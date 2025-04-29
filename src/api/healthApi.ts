import axios from '@src/api/axiosInstance';

export const fetchBase = async () => {
	return await axios.get('/');
};
