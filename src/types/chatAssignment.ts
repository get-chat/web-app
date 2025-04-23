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
