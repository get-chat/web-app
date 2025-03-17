import { Group, GroupList } from '@src/types/groups';

export const sortGroups = (groups: GroupList): Group[] => {
	return Object.values(groups)?.sort(function (a: Group, b: Group) {
		return (
			a.name?.toLowerCase()?.localeCompare(b.name?.toLowerCase() ?? '') ?? -1
		);
	});
};
