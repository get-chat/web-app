import { useEffect, useMemo, useRef, useState } from 'react';
import { setUserPreference } from '@src/helpers/StorageHelper';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { useSearchParams } from 'react-router-dom';
import FilterQueryParams from '@src/enums/FilterQueryParams';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';

const useChatFilters = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const filterTagId = useAppSelector((state) => state.filterTagId.value);

	const userPreference = useMemo(() => {
		return currentUser?.getPreferences();
	}, [currentUser]);

	const [searchParams] = useSearchParams();

	const dispatch = useAppDispatch();

	const hasAnyFilterQueryParam = () => {
		for (let queryParamKey of Object.values(FilterQueryParams)) {
			if (searchParams.has(queryParamKey)) return true;
		}
	};

	const parseDateFilter = (filterQueryParam: FilterQueryParams) => {
		const queryParam = searchParams.get(filterQueryParam);
		if (queryParam && !isNaN(Date.parse(queryParam))) {
			return new Date(queryParam);
		}

		return undefined;
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
		parseDateFilter(FilterQueryParams.MESSAGES_SINCE_TIME) ??
			(userPreference?.filters?.filterStartDate
				? new Date(userPreference?.filters?.filterStartDate)
				: undefined)
	);
	const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(
		parseDateFilter(FilterQueryParams.MESSAGES_BEFORE_TIME) ??
			(userPreference?.filters?.filterEndDate
				? new Date(userPreference?.filters?.filterEndDate)
				: undefined)
	);

	const isMounted = useRef(false);

	useEffect(() => {
		console.log(filterStartDate);
	}, [filterStartDate]);

	useEffect(() => {
		if (currentUser) {
			const filterTagIdQueryParam =
				parseInt(searchParams.get(FilterQueryParams.CHAT_TAG_ID) ?? '') ||
				undefined;

			// User preference
			const preference = currentUser.getPreferences();
			dispatch(
				setFilterTagId(
					filterTagIdQueryParam ?? preference?.filters?.filterTagId
				)
			);
		}
	}, [currentUser]);

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
