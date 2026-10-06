import axios from '@src/api/axiosInstance';
import { Analytics, AnalyticsParams } from '@src/types/analytics';

export const fetchAnalytics = async (
	params: AnalyticsParams,
	signal?: AbortSignal
): Promise<Analytics> => {
	const response = await axios.get<Analytics>('/analytics/', {
		params,
		// Repeat list filters as user=1&user=2, the way the API reads them
		paramsSerializer: { indexes: null },
		signal,
	});
	return response.data;
};
