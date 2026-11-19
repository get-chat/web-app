import api from '@src/api/axiosInstance';
import {
	CreateWhatsAppGroupRequest,
	InviteToWhatsAppGroupRequest,
	InviteToWhatsAppGroupResponse,
	JoinRequestsApproveResponse,
	JoinRequestsRejectResponse,
	UpdateWhatsAppGroupRequest,
	WhatsAppGroup,
	WhatsAppGroupDetail,
	WhatsAppGroupEligibility,
	WhatsAppGroupParticipantRef,
} from '@src/types/whatsappGroups';

// WhatsApp groups. `/groups/` is taken by the inbox's user groups (teams).
const BASE = '/whatsapp_groups/';

const groupPath = (id: string) => `${BASE}${encodeURIComponent(id)}/`;

export const fetchWhatsAppGroupEligibility = async (signal?: AbortSignal) => {
	const response = await api.get<WhatsAppGroupEligibility>(
		`${BASE}eligibility/`,
		{ signal }
	);
	return response.data;
};

export const createWhatsAppGroup = async (data: CreateWhatsAppGroupRequest) => {
	const response = await api.post<WhatsAppGroup>(BASE, data);
	return response.data;
};

export const fetchWhatsAppGroup = async (id: string, signal?: AbortSignal) => {
	const response = await api.get<WhatsAppGroupDetail>(groupPath(id), {
		signal,
	});
	return response.data;
};

export const updateWhatsAppGroup = async (
	id: string,
	data: UpdateWhatsAppGroupRequest
) => {
	const response = await api.patch<WhatsAppGroup>(groupPath(id), data);
	return response.data;
};

export const uploadWhatsAppGroupPicture = async (id: string, file: File) => {
	const formData = new FormData();
	formData.append('file', file);
	await api.post(`${groupPath(id)}picture/`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
};

export const deleteWhatsAppGroup = async (id: string) => {
	await api.delete(groupPath(id));
};

export const resetWhatsAppGroupInviteLink = async (id: string) => {
	const response = await api.post<{ invite_link: string }>(
		`${groupPath(id)}invite_link/reset/`
	);
	return response.data;
};

export const removeWhatsAppGroupParticipants = async (
	id: string,
	participants: WhatsAppGroupParticipantRef[]
) => {
	await api.post(`${groupPath(id)}participants/remove/`, { participants });
};

export const approveWhatsAppGroupJoinRequests = async (
	id: string,
	joinRequestIds: string[]
) => {
	const response = await api.post<JoinRequestsApproveResponse>(
		`${groupPath(id)}join_requests/approve/`,
		{ join_request_ids: joinRequestIds }
	);
	return response.data;
};

export const rejectWhatsAppGroupJoinRequests = async (
	id: string,
	joinRequestIds: string[]
) => {
	const response = await api.post<JoinRequestsRejectResponse>(
		`${groupPath(id)}join_requests/reject/`,
		{ join_request_ids: joinRequestIds }
	);
	return response.data;
};

export const inviteToWhatsAppGroup = async (
	id: string,
	data: InviteToWhatsAppGroupRequest
) => {
	const response = await api.post<InviteToWhatsAppGroupResponse>(
		`${groupPath(id)}invite/`,
		data
	);
	return response.data;
};
