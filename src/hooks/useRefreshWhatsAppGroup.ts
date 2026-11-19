import { useCallback } from 'react';
import { fetchWhatsAppGroup } from '@src/api/whatsappGroupsApi';
import { useAppDispatch } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import { store } from '@src/store';

/**
 * Re-fetches the open chat's WhatsApp group with its live participants and
 * join requests, which the header and the group info panel show. A response
 * for a group that is no longer open is dropped.
 */
const useRefreshWhatsAppGroup = () => {
	const dispatch = useAppDispatch();

	return useCallback(
		async (id: string) => {
			try {
				const data = await fetchWhatsAppGroup(id);
				if (store.getState().UI.currentWhatsAppGroup?.id === id) {
					dispatch(setState({ currentWhatsAppGroup: data }));
				}
				return data;
			} catch (error) {
				console.error(error);
				return undefined;
			}
		},
		[dispatch]
	);
};

export default useRefreshWhatsAppGroup;
