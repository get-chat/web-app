import { useEffect, useMemo, useRef, useState } from 'react';
import { setUserPreference } from '@src/helpers/StorageHelper';
import { useAppSelector } from '@src/store/hooks';
import { useSearchParams } from 'react-router-dom';

enum FilterQueryParams {
	LIMIT = 'filter_chats_by_limit',
	OFFSET = 'filter_chats_by_offset',
	SEARCH = 'filter_chats_by_search',
	ASSIGNED_TO_ME = 'filter_chats_by_assigned_to_me',
	ASSIGNED_GROUP = 'filter_chats_by_assigned_group',
	CHAT_TAG_ID = 'filter_chats_by_chat_tag_id',
	MESSAGES_SINCE_TIME = 'filter_chats_by_messages_since_time',
	MESSAGES_BEFORE_TIME = 'filter_chats_by_messages_before_time',
}

const useChatFilters = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const filterTagId = useAppSelector((state) => state.filterTagId.value);

	const userPreference = useMemo(() => {
		return currentUser?.getPreferences();
	}, [currentUser]);

	const [searchParams] = useSearchParams();

	const hasAnyFilterQueryParam = () => {
		for (let queryParamKey of Object.values(FilterQueryParams)) {
			if (searchParams.has(queryParamKey)) return true;
		}
	};

	const [filterAssignedToMe, setFilterAssignedToMe] = useState<boolean>(
		searchParams.get(FilterQueryParams.ASSIGNED_TO_ME) === '1' ||
			userPreference?.filters?.filterAssignedToMe ||
			false
	);
	const [filterAssignedGroupId, setFilterAssignedGroupId] = useState<
		number | undefined
	>(
		parseInt(searchParams.get(FilterQueryParams.ASSIGNED_GROUP) ?? '') ||
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
		if (isMounted.current || hasAnyFilterQueryParam()) {
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
