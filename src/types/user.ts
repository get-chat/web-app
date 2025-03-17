export interface UserProfile {
	role: string;
	large_avatar: string;
	avatar: string;
}

export interface UserGroup {
	id: number;
	name: string;
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
	groups: UserGroup[];
	permissions: UserPermissions;
}

export type UserList = {
	[key: string]: User;
};
