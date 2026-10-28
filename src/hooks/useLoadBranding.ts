import { useEffect } from 'react';
import { fetchBranding } from '@src/api/brandingApi';
import { useAppDispatch } from '@src/store/hooks';
import { setBranding } from '@src/store/reducers/brandingReducer';

// Loads the branding of the request's inbox (MT 5.3): on the login page the
// instance's, in Main the active inbox's (Main mounts afresh on every switch)
const useLoadBranding = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const load = async () => {
			try {
				dispatch(setBranding(await fetchBranding()));
			} catch (error) {
				// Backends before MT 5.3 have no branding: the app's own then
				console.error('Error in useLoadBranding', error);
			}
		};
		load();
	}, []);
};

export default useLoadBranding;
