import { UserList } from '@src/api/responses/UsersResponse';
import UserModel from '@src/api/models/UserModel';

export const sortUsers = (users: UserList): UserModel[] => {
	return Object.values(users)?.sort(function (a: UserModel, b: UserModel) {
		return (
			a.username
				?.toLowerCase()
				?.localeCompare(b.username?.toLowerCase() ?? '') ?? -1
		);
	});
};
