import { useEffect, useMemo, useRef, useState } from 'react';
import {
	getUserPreferences,
	storeUserPreference,
} from '@src/helpers/StorageHelper';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import {
	createSearchParams,
	useLocation,
	useNavigate,
	useSearchParams,
} from 'react-router-dom';
import FilterQueryParams from '@src/enums/FilterQueryParams';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import { formatDate } from '@src/helpers/DateHelper';
import { CHAT_FILTER_PREFIX } from '@src/Constants';

const LIMIT_DEFAULT = 20;

const useChatFilters = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const filterTagId = useAppSelector((state) => state.filterTagId.value);

	const initialUserPreference = useMemo(() => {
		return getUserPreferences()?.[currentUser?.id ?? 0];
	}, [currentUser]);

	const [searchParams] = useSearchParams();

	const dispatch = useAppDispatch();

	const hasAnyFilterQueryParam = useMemo(() => {
		for (let searchParamKey in Object.fromEntries(searchParams.entries())) {
			if (searchParamKey.startsWith(CHAT_FILTER_PREFIX)) return true;
		}
		return false;
	}, []);

	const parseDateFilter = (filterQueryParam: FilterQueryParams) => {
		const queryParam = searchParams.get(filterQueryParam);
		if (queryParam && !isNaN(Date.parse(queryParam))) {
			return new Date(queryParam);
		}

		return undefined;
	};

	const [dynamicFilters, setDynamicFilters] = useState<{ [key: string]: any }>(
		{}
	);

	const [chatsLimit, setChatsLimit] = useState(
		parseInt(searchParams.get(FilterQueryParams.LIMIT) ?? '') || LIMIT_DEFAULT
	);

	const [chatsOffset, setChatsOffset] = useState(
		parseInt(searchParams.get(FilterQueryParams.OFFSET) ?? '') || undefined
	);

	const [keyword, setKeyword] = useState(
		searchParams.get(FilterQueryParams.SEARCH) ?? ''
	);

	const [filterAssignedToMe, setFilterAssignedToMe] = useState<boolean>(
		initialUserPreference?.filters?.filterAssignedToMe || false
	);
	const [filterAssignedGroupId, setFilterAssignedGroupId] = useState<
		number | undefined
	>(initialUserPreference?.filters?.filterAssignedGroupId);
	const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(
		initialUserPreference?.filters?.filterStartDate
			? new Date(initialUserPreference?.filters?.filterStartDate)
			: undefined
	);
	const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(
		initialUserPreference?.filters?.filterEndDate
			? new Date(initialUserPreference?.filters?.filterEndDate)
			: undefined
	);

	const isMounted = useRef(false);

	const navigate = useNavigate();

	const getDynamicFilters = () => {
		const dynamicFilters = Object.fromEntries(searchParams.entries());
		const preparedDynamicFilters = { ...dynamicFilters };
		for (let dynamicFilterKey in dynamicFilters) {
			if (
				!dynamicFilterKey.startsWith(CHAT_FILTER_PREFIX) ||
				dynamicFilterKey === CHAT_FILTER_PREFIX ||
				!dynamicFilters[dynamicFilterKey] ||
				// @ts-ignore
				Object.values(FilterQueryParams).includes(dynamicFilterKey)
			) {
				delete preparedDynamicFilters[dynamicFilterKey];
			}
		}

		return preparedDynamicFilters;
	};

	useEffect(() => {
		// Here chat filter id in store will be filled if no filter query param is provided
		if (currentUser && !hasAnyFilterQueryParam) {
			// User preference
			const preference = getUserPreferences()?.[currentUser.id];
			setDynamicFilters(preference?.dynamicFilters ?? {});
			dispatch(setFilterTagId(preference?.filters?.filterTagId));
		}
	}, [currentUser, hasAnyFilterQueryParam]);

	useEffect(() => {
		if (hasAnyFilterQueryParam) {
			// Overriding all filters if there is at least one filter query param
			// Skipping limit and offset as they are not stored

			setDynamicFilters(getDynamicFilters());

			setFilterAssignedToMe(
				searchParams.get(FilterQueryParams.ASSIGNED_TO_ME) === '1'
			);

			setFilterAssignedGroupId(
				parseInt(searchParams.get(FilterQueryParams.ASSIGNED_GROUP) ?? '') ||
					undefined
			);

			dispatch(
				setFilterTagId(
					parseInt(searchParams.get(FilterQueryParams.CHAT_TAG_ID) ?? '') ||
						undefined
				)
			);

			setFilterStartDate(
				parseDateFilter(FilterQueryParams.MESSAGES_SINCE_TIME)
			);

			setFilterEndDate(parseDateFilter(FilterQueryParams.MESSAGES_BEFORE_TIME));
		}
	}, [hasAnyFilterQueryParam]);

	useEffect(() => {
		if (isMounted.current) {
			// Store filters
			storeUserPreference(currentUser?.id, {
				filters: {
					filterTagId: filterTagId,
					filterAssignedToMe: filterAssignedToMe,
					filterAssignedGroupId: filterAssignedGroupId,
					filterStartDate: filterStartDate?.getTime(),
					filterEndDate: filterEndDate?.getTime(),
				},
				dynamicFilters: dynamicFilters,
			});
		} else {
			isMounted.current = true;
		}
	}, [
		dynamicFilters,
		filterAssignedToMe,
		filterAssignedGroupId,
		filterTagId,
		filterStartDate,
		filterEndDate,
	]);

	const location = useLocation();

	useEffect(() => {
		if (isMounted.current) {
			let params: { [key: string]: any } = {
				[FilterQueryParams.LIMIT]: chatsLimit,
				[FilterQueryParams.OFFSET]: chatsOffset,
				[FilterQueryParams.SEARCH]: keyword,
				[FilterQueryParams.ASSIGNED_TO_ME]: filterAssignedToMe ? 1 : null,
				[FilterQueryParams.ASSIGNED_GROUP]: filterAssignedGroupId,
				[FilterQueryParams.CHAT_TAG_ID]: filterTagId,
				[FilterQueryParams.MESSAGES_SINCE_TIME]: formatDate(filterStartDate),
				[FilterQueryParams.MESSAGES_BEFORE_TIME]: formatDate(filterEndDate),
			};

			// Combine with dynamic filters to update URL
			params = { ...params, ...dynamicFilters };

			// Filter object
			for (let key in params) {
				// Delete if empty or limit has default value
				if (
					(key === FilterQueryParams.LIMIT && params[key] === LIMIT_DEFAULT) ||
					!params[key]
				)
					delete params[key];
			}

			// Prepare navigate options
			const options = {
				pathname: location?.pathname,
				search: `?${createSearchParams(params)}`,
			};

			// Update query params
			navigate(options, { replace: true });
		}
	}, [
		dynamicFilters,
		chatsLimit,
		chatsOffset,
		keyword,
		filterAssignedToMe,
		filterAssignedGroupId,
		filterTagId,
		filterStartDate,
		filterEndDate,
	]);

	const removeDynamicFilter = (key: string) => {
		setDynamicFilters((prevState) => {
			delete prevState[key];
			return { ...prevState };
		});
	};

	return {
		dynamicFilters,
		removeDynamicFilter,
		chatsLimit,
		chatsOffset,
		keyword,
		setKeyword,
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
