// An inbox (tenant) the logged-in account is a member of (MT 3.6). The name
// falls back to the phone number, and then to the id, on the backend.
export interface Tenant {
	id: string;
	name: string;
	phone_number: string;
}

export interface TenantListResponse {
	tenants: Tenant[];
}

// The 400 of a password login for an account in several inboxes, sent only
// once the password was checked
export interface TenantChoiceRequiredResponse {
	reason: string;
	tenants: Tenant[];
}

export interface AcceptInviteRequest {
	code: string;
	// Accept with this account (with `password`), or create it (`new_account`).
	// Without both the invite is accepted for the request's own token.
	username?: string;
	password?: string;
	new_account?: boolean;
}

export interface AcceptInviteResponse {
	username: string;
	tenant: Tenant;
}
