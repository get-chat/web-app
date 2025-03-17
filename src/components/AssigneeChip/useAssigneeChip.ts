import { useAppSelector } from '@src/store/hooks';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { AssigneeType } from '@src/components/AssigneeChip/AssigneeChip';
import { CancelTokenSource } from 'axios';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { GroupList } from '@src/api/responses/GroupsResponse';
import { UserList } from '@src/types/user';

interface Props {
	assigneeType: AssigneeType;
	isActionable: boolean;
}

const useAssigneeChip = ({ assigneeType, isActionable }: Props) => {
	const cancelTokenSourceRef = useRef<CancelTokenSource>();

	let users: UserList = {};
	let groups: GroupList = {};

	if (isActionable) {
		users = useAppSelector((state) => state.users.value);
		groups = useAppSelector((state) => state.groups.value);
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
		if (event.currentTarget instanceof Element) {
			setMenuAnchorEl(event.currentTarget);
		}
	};

	const hideMenu = () => {
		setMenuAnchorEl(undefined);
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
