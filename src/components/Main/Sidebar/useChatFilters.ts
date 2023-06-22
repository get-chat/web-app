import { UserPreference } from '@src/interfaces/UserPreference';
import { useEffect, useMemo, useState } from 'react';
import {
	getUserPreferences,
	setUserPreference,
} from '@src/helpers/StorageHelper';
import { useAppSelector } from '@src/store/hooks';

const useChatFilters = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const filterTagId = useAppSelector((state) => state.filterTagId.value);

	const userPreference: UserPreference | undefined = useMemo(() => {
		if (currentUser) {
			return getUserPreferences()?.[currentUser.id?.toString() ?? ''];
		}
	}, [currentUser]);

	const [filterAssignedToMe, setFilterAssignedToMe] = useState<boolean>(
		userPreference?.filters?.filterAssignedToMe ?? false
	);
	const [filterAssignedGroupId, setFilterAssignedGroupId] = useState<
		number | undefined
	>(userPreference?.filters?.filterAssignedGroupId);
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

	useEffect(() => {
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
