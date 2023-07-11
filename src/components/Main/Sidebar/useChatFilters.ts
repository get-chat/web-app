import { useEffect, useMemo, useRef, useState } from 'react';
import { setUserPreference } from '@src/helpers/StorageHelper';
import { useAppSelector } from '@src/store/hooks';
import { useSearchParams } from 'react-router-dom';

const useChatFilters = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const filterTagId = useAppSelector((state) => state.filterTagId.value);

	const userPreference = useMemo(() => {
		return currentUser?.getPreferences();
	}, [currentUser]);

	const [searchParams] = useSearchParams();

	const [filterAssignedToMe, setFilterAssignedToMe] = useState<boolean>(
		searchParams.get('filter_chats_by_assigned_to_me') === '1' ||
			userPreference?.filters?.filterAssignedToMe ||
			false
	);
	const [filterAssignedGroupId, setFilterAssignedGroupId] = useState<
		number | undefined
	>(
		parseInt(searchParams.get('filter_chats_by_assigned_group') ?? '') ||
			userPreference?.filters?.filterAssignedGroupId
	);
	const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(
		userPreference?.filters?.filterStartDate
			? new Date(userPreference?.filters?.filterStartDate)
			: undefined
	);
	const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(
		userPreference?.filters?.filterEndDate
			? new Date(userPreference?.filters?.filterEndDate)
			: undefined
	);

	const isMounted = useRef(false);

	useEffect(() => {
		if (isMounted.current) {
			// Store filters
			setUserPreference(currentUser?.id, {
				filters: {
					filterTagId: filterTagId,
					filterAssignedToMe: filterAssignedToMe,
					filterAssignedGroupId: filterAssignedGroupId,
					filterStartDate: filterStartDate?.getTime(),
					filterEndDate: filterEndDate?.getTime(),
				},
			});
		} else {
			isMounted.current = true;
		}
	}, [
		filterAssignedToMe,
		filterAssignedGroupId,
		filterTagId,
		filterStartDate,
		filterEndDate,
	]);

	return {
		userPreference,
		filterTagId,
		filterAssignedToMe,
		setFilterAssignedToMe,
		filterAssignedGroupId,
		setFilterAssignedGroupId,
		filterStartDate,
		setFilterStartDate,
		filterEndDate,
		setFilterEndDate,
	};
};

export default useChatFilters;
