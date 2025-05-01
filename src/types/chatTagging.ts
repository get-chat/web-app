import { Tag } from '@src/types/tags';
import { User } from '@src/types/users';

export interface CreateChatTaggingRequest {
	tag: number;
	chat: string;
}

export interface CreateChatTaggingResponse {
	id: number;
	tag: number;
	chat: string;
}

export interface FetchChatTaggingEventsRequest {
	wa_id: string;
	before_time?: number;
	since_time?: number;
}

export interface FetchChatTaggingEvent {
	timestamp: number;
	action: 'added' | 'removed';
	tag: Tag;
	chat: string;
	done_by?: User;
}
