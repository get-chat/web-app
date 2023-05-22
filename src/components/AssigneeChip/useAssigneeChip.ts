import { UserList } from '@src/api/responses/UsersResponse';
import { useAppSelector } from '@src/store/hooks';
import { MouseEvent, useState } from 'react';

interface Props {
	isActionable: boolean;
}

const useAssigneeChip = ({ isActionable }: Props) => {
	let users: UserList = {};

	if (isActionable) {
		users = useAppSelector((state) => state.users.value);
	}

	const [menuAnchorEl, setMenuAnchorEl] = useState<Element>();

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
	};
};

export default useAssigneeChip;
