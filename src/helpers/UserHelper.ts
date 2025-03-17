import { User, UserList } from '@src/types/user';

export const sortUsers = (users: UserList): User[] => {
	return Object.values(users)?.sort(function (a: User, b: User) {
		return (
			a.username
				?.toLowerCase()
				?.localeCompare(b.username?.toLowerCase() ?? '') ?? -1
		);
	});
};

export const prepareUserLabel = (user: User) => {
	let label = '';
	if (user.first_name) {
		label = user.first_name;
	}

	if (user.last_name) {
		if (label) {
			label += ' ';
		}

		label += user.last_name;
	}

	if (label) {
		label += ` (${user.username})`;
	} else {
		label = user.username ?? '';
	}

	return label;
};

export const isUserInGroup = (user: User | undefined, groupId: number) => {
	let inGroup = false;

	user?.groups?.forEach((groupItem) => {
		if (groupItem?.id === groupId) {
			inGroup = true;
		}
	});

	return inGroup;
};
