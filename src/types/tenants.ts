// An inbox (tenant) the logged-in account is a member of (MT 3.6). The name
// falls back to the phone number, and then to the id, on the backend.
export interface Tenant {
	id: string;
	name: string;
	phone_number: string;
}

// The inbox of the request (GC-72). Read-only: everything can be read, but
// no message can be sent; 360dialog removes the inbox on remove_at unless
// the channel is upgraded.
export interface CurrentTenant extends Tenant {
	access_mode: 'full' | 'read_only';
	read_only_reason:
		| 'trial_ended'
		| 'not_premium'
		| 'channel_terminated'
		| 'removed'
		| null;
	upgrade_url: string | null;
	remove_at: string | null;
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
	// The new membership's Auth Token, for that inbox only. For an account
	// that logs in with 360dialog only it may be the one way into the inbox,
	// so it is kept. Absent from backends before inbox!1117.
	token?: string;
}
