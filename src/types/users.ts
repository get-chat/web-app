import { Group } from '@src/types/groups';

export interface UserProfile {
	role: string;
	is_available: boolean;
	large_avatar: string;
	avatar: string;
}

export interface UserPermissions {
	can_use_tags: boolean;
	can_read_chats: 'all' | 'group' | 'user' | 'none';
	can_write_to_chats: 'all' | 'group' | 'user' | 'none';
}

export interface User {
	url: string;
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	profile: UserProfile;
	groups: Group[];
	permissions: UserPermissions;
}

export type UserList = {
	[key: string]: User;
};

export interface UpdateUserAvailabilityRequest {
	is_available: boolean;
}

export interface UpdateUserAvailabilityResponse {
	is_available: boolean;
}

export interface UserAvailabilityEvent {
	is_available: boolean;
	user: User;
}
