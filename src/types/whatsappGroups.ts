// WhatsApp groups (PTSS-488). Not the inbox's user groups (types/groups.ts),
// which assign chats to teams.

export type WhatsAppGroupStatus =
	| 'creating'
	| 'active'
	| 'create_failed'
	| 'suspended'
	| 'deleted';

export type WhatsAppGroupJoinApprovalMode =
	| 'auto_approve'
	| 'approval_required';

export type WhatsAppGroupIneligibilityReason =
	| 'not_cloud_api'
	| 'not_oba'
	| 'coexistence'
	| 'limit_reached';

export interface WhatsAppGroup {
	id: string;
	group_id: string | null;
	// The chat's wa_id (/main/chat/:waId), once the group exists
	wa_id: string | null;
	status: WhatsAppGroupStatus;
	// Why creating it failed (create_failed)
	error: string | null;
	subject: string;
	description: string;
	join_approval_mode: WhatsAppGroupJoinApprovalMode;
	invite_link: string | null;
	created_timestamp: number | null;
	max_participants: number;
}

export interface WhatsAppGroupParticipant {
	wa_id?: string;
	user_id?: string;
	username?: string;
	name?: string;
}

export interface WhatsAppGroupJoinRequest {
	join_request_id: string;
	wa_id?: string;
	user_id?: string;
	name?: string;
	creation_timestamp: number;
}

/** GET {id}/: the stored group plus what 360dialog says about it right now */
export interface WhatsAppGroupDetail extends WhatsAppGroup {
	participants?: WhatsAppGroupParticipant[];
	total_participant_count?: number;
	join_requests?: WhatsAppGroupJoinRequest[];
	// The live part could not be fetched; the stored fields are still there
	live_error?: string;
}

export interface WhatsAppGroupEligibility {
	eligible: boolean;
	reason: WhatsAppGroupIneligibilityReason | null;
}

export interface CreateWhatsAppGroupRequest {
	subject: string;
	description?: string;
	join_approval_mode?: WhatsAppGroupJoinApprovalMode;
}

export interface UpdateWhatsAppGroupRequest {
	subject?: string;
	description?: string;
}

export type WhatsAppGroupParticipantRef =
	| { wa_id: string }
	| { user_id: string };

export interface JoinRequestsApproveResponse {
	approved: string[];
	failed: { join_request_id: string; error: string }[];
}

export interface JoinRequestsRejectResponse {
	rejected: string[];
	failed: { join_request_id: string; error: string }[];
}

export interface InviteToWhatsAppGroupRequest {
	wa_ids: string[];
	template_name: string;
	language: string;
}

export interface InviteToWhatsAppGroupResponse {
	sent: string[];
	failed: { wa_id: string; error: string }[];
}

/** The getchat_webhook `whatsapp_group_update` event */
export interface WhatsAppGroupUpdateEvent {
	id: string;
	wa_id: string | null;
	status: WhatsAppGroupStatus;
}

/** Who sent an inbound group message */
export interface GroupParticipantRef {
	wa_id?: string;
	user_id?: string;
	username?: string;
	name?: string;
}
