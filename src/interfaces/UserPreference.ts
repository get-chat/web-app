export interface UserPreference {
	filters?: {
		filterTagId?: number;
		filterAssignedToMe?: boolean;
		filterAssignedGroupId?: number;
		filterStartDate?: number;
		filterEndDate?: number;
		filterUnread?: boolean;
	};
	dynamicFilters?: { [key: string]: any };
	weekStartsOn?: number;
	updatedAt?: number;
}
