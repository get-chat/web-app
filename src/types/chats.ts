import { Contact } from '@src/types/contacts';
import { Tag } from '@src/types/tags';
import { Message } from '@src/types/messages';
import { User } from '@src/types/users';

export interface Chat {
	contact: Contact;
	new_messages: number;
	wa_id: string;
	last_message?: Message;
	assigned_to_user?: User;
	assigned_group: any;
	tags: Tag[];
}

export interface FetchChatsParams {
	limit?: number;
	offset?: number;
	chat_tag_id?: number;
	search?: string;
	assigned_to_me?: boolean;
	assigned_group?: number;
	messages_since_time?: number;
	messages_before_time?: number;
	blocked?: boolean;
	reported?: boolean;
	message_has_referral?: boolean;
	message_referral_source_url?: string;
	message_referral_source_id?: string;
	message_referral_source_type?: 'ad' | 'post';
	message_referral_headline?: string;
	message_referral_body?: string;
	message_referral_media_type?: 'image' | 'video';
}

export interface ChatList {
	[key: string]: Chat;
}
