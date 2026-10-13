import { useAppSelector } from '@src/store/hooks';

// Whether 360dialog made this inbox read-only (GC-72): nothing can be sent
const useIsTenantReadOnly = () =>
	useAppSelector(
		(state) => state.currentTenant.value?.access_mode === 'read_only'
	);

export default useIsTenantReadOnly;
