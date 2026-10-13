import api from '@src/api/axiosInstance';
import {
	AcceptInviteRequest,
	AcceptInviteResponse,
	CurrentTenant,
	Tenant,
	TenantListResponse,
} from '@src/types/tenants';

// The inboxes the account behind the token is a member of
export const fetchTenants = async () => {
	const response = await api.get<TenantListResponse>('/users/current/tenants/');
	return response.data;
};

// The inbox of the token, with its access mode (GC-72)
export const fetchCurrentTenant = async () => {
	const response = await api.get<CurrentTenant>('/tenants/current/');
	return response.data;
};

// Switches the inbox of the backend session (session authentication only:
// an auth token always belongs to one inbox)
export const switchSessionTenant = async (tenant: string) => {
	const response = await api.post<Tenant>(
		'/users/current/tenant/',
		{ tenant },
		{
			withCredentials: true,
			// Session authentication is CSRF-protected, see authApi's logout
			xsrfCookieName: 'csrftoken',
			xsrfHeaderName: 'X-CSRFToken',
		}
	);
	return response.data;
};

export const acceptInvite = async (data: AcceptInviteRequest) => {
	const response = await api.post<AcceptInviteResponse>(
		'/auth/accept_invite/',
		data
	);
	return response.data;
};
