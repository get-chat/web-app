import { Group } from '@src/types/groups';
import { User } from '@src/types/users';

export interface ChatAssignment {
	wa_id: string;
	assigned_to_user: number | null;
	assigned_group: number | null;
}

export interface UpdateChatAssignmentRequest {
	wa_id: string;
	assigned_to_user: number | null;
	assigned_group: number | null;
}

export interface ChatAssignmentEvent {
	assigned_group_set?: Group;
	assigned_group_was_cleared: boolean;
	assigned_to_user_set?: User;
	assigned_to_user_was_cleared: boolean;
	done_by?: User;
	timestamp: number;
	wa_id: string;
}

export interface FetchChatAssignmentEventsRequest {
	wa_id: string;
	before_time?: number;
	since_time?: number;
}

export interface PartialUpdateChatAssignmentRequest {
	wa_id: string;
	assigned_to_user?: number | null;
	assigned_group?: number | null;
}
