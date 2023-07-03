export interface UserPreference {
	filters?: {
		filterTagId?: number;
		filterAssignedToMe?: boolean;
		filterAssignedGroupId?: number;
		filterStartDate?: number;
		filterEndDate?: number;
	};
	weekStartsOn?: number;
	updatedAt?: number;
}
