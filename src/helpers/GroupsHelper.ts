import { GroupList } from '@src/api/responses/GroupsResponse';
import GroupModel from '@src/api/models/GroupModel';

export const sortGroups = (groups: GroupList): GroupModel[] => {
	return Object.values(groups)?.sort(function (a: GroupModel, b: GroupModel) {
		return (
			a.name?.toLowerCase()?.localeCompare(b.name?.toLowerCase() ?? '') ?? -1
		);
	});
};
