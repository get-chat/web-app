import { useEffect, useMemo, useRef, useState } from 'react';
import { setUserPreference } from '@src/helpers/StorageHelper';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import {
	createSearchParams,
	useLocation,
	useNavigate,
	useSearchParams,
} from 'react-router-dom';
import FilterQueryParams from '@src/enums/FilterQueryParams';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';

const LIMIT_DEFAULT = 20;

const useChatFilters = () => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const filterTagId = useAppSelector((state) => state.filterTagId.value);

	const userPreference = useMemo(() => {
		return currentUser?.getPreferences();
	}, [currentUser]);

	const [searchParams] = useSearchParams();

	const dispatch = useAppDispatch();

	const hasAnyFilterQueryParam = useMemo(() => {
		for (let queryParamKey of Object.values(FilterQueryParams)) {
			if (searchParams.has(queryParamKey)) return true;
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
		userPreference?.filters?.filterAssignedToMe || false
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

	const isMounted = useRef(false);

	const navigate = useNavigate();

	useEffect(() => {
		// Here chat filter id in store will be filled if no filter query param is provided
		if (currentUser && !hasAnyFilterQueryParam) {
			// User preference
			const preference = currentUser.getPreferences();
			dispatch(setFilterTagId(preference?.filters?.filterTagId));
		}
	}, [currentUser, hasAnyFilterQueryParam]);

	useEffect(() => {
		if (hasAnyFilterQueryParam) {
			// Overriding all filters if there is at least one filter query param
			// Skipping limit and offset as they are not stored

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

	const location = useLocation();

	useEffect(() => {
		if (isMounted.current) {
			const params: { [key: string]: any } = {
				[FilterQueryParams.LIMIT]: chatsLimit,
				[FilterQueryParams.OFFSET]: chatsOffset,
				[FilterQueryParams.SEARCH]: keyword,
				[FilterQueryParams.ASSIGNED_TO_ME]: filterAssignedToMe ? 1 : null,
				[FilterQueryParams.ASSIGNED_GROUP]: filterAssignedGroupId,
				[FilterQueryParams.CHAT_TAG_ID]: filterTagId,
				[FilterQueryParams.MESSAGES_SINCE_TIME]: filterStartDate
					?.toISOString()
					?.split('T')[0],
				[FilterQueryParams.MESSAGES_BEFORE_TIME]: filterEndDate
					?.toString()
					?.split('T')[0],
			};

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
				pathname: location.pathname,
				search: `?${createSearchParams(params)}`,
			};

			// Update query params
			navigate(options, { replace: true });
		}
	}, [
		chatsLimit,
		chatsOffset,
		keyword,
		filterAssignedToMe,
		filterAssignedGroupId,
		filterTagId,
		filterStartDate,
		filterEndDate,
	]);

	return {
		userPreference,
		chatsLimit,
		chatsOffset,
		setChatsLimit,
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
