import { UserList } from '@src/api/responses/UsersResponse';
import { useAppSelector } from '@src/store/hooks';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import useGroupsAPI from '@src/hooks/api/useGroupsAPI';
import { AssigneeType } from '@src/components/AssigneeChip/AssigneeChip';
import { CancelTokenSource } from 'axios';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import GroupsResponse, { GroupList } from '@src/api/responses/GroupsResponse';
import { getObjLength } from '@src/helpers/ObjectHelper';

interface Props {
	assigneeType: AssigneeType;
	isActionable: boolean;
}

const useAssigneeChip = ({ assigneeType, isActionable }: Props) => {
	const cancelTokenSourceRef = useRef<CancelTokenSource>();

	const [groups, setGroups] = useState<GroupList>({});

	const { listGroups } = useGroupsAPI();

	let users: UserList = {};

	if (isActionable) {
		users = useAppSelector((state) => state.users.value);
	}

	const [menuAnchorEl, setMenuAnchorEl] = useState<Element>();

	useEffect(() => {
		if (isActionable) {
			cancelTokenSourceRef.current = generateCancelToken();
		}

		return () => {
			cancelTokenSourceRef.current?.cancel();
		};
	}, [isActionable]);

	const displayMenu = (event: MouseEvent) => {
		if (assigneeType === AssigneeType.group && getObjLength(groups) === 0) {
			doListGroups();
		}

		if (event.currentTarget instanceof Element) {
			setMenuAnchorEl(event.currentTarget);
		}
	};

	const hideMenu = () => {
		setMenuAnchorEl(undefined);
	};

	const doListGroups = async () => {
		await listGroups({
			cancelToken: cancelTokenSourceRef.current?.token,
			onSuccess: (response) => {
				const groupsResponse = new GroupsResponse(response.data);
				setGroups(groupsResponse.groups);
			},
		});
	};

	return {
		menuAnchorEl,
		displayMenu,
		hideMenu,
		users,
		groups,
	};
};

export default useAssigneeChip;
