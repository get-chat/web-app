import { useEffect, useState } from 'react';
import { isCancel } from 'axios';
import { fetchAnalytics } from '@src/api/analyticsApi';
import { Analytics, AnalyticsParams } from '@src/types/analytics';

/** Loads analytics again whenever the params change, keeping the last data */
const useAnalytics = (params: AnalyticsParams) => {
	const [data, setData] = useState<Analytics>();
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState<unknown>();
	const [reloadCount, setReloadCount] = useState(0);

	const key = JSON.stringify(params);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);

		fetchAnalytics(params, controller.signal)
			.then(setData)
			.catch((error) => {
				if (!isCancel(error)) setError(error);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});

		return () => controller.abort();
	}, [key, reloadCount]);

	const reload = () => setReloadCount((count) => count + 1);

	return { data, isLoading, error, reload };
};

export default useAnalytics;
