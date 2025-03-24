import { Contact } from '@src/types/contacts';
import { Tag } from '@src/types/tags';
import { Group } from '@src/types/groups';
import { Template } from '@src/types/templates';
import { User } from '@src/types/users';

export interface FetchMessagesRequest {
	wa_id?: string;
	limit?: number;
	offset?: number;
	since_time?: number;
	before_time?: number;
	mark_as_received?: number;
	chat_tag_id?: number;
	search?: string;
	assigned_to_me?: boolean;
	assigned_group?: number;
	from_us?: boolean;
}

export interface CreateMessageRequest {
	wa_id?: string;
	type?: MessageType;
	text?: Text;
	template?: Template;
	interactive?: Interactive;
	video?: Video;
	image?: Image;
	audio?: Audio;
	voice?: Voice;
	document?: Document;
	pending_message_unique_id?: string;
}

export interface Message {
	id: string;
	waba_payload?: WabaPayload;
	waba_statuses?: WabaStatuses;
	contact?: Contact;
	from_us: boolean;
	received: boolean;
	sender?: User;
	customer_wa_id: string;
	tags: any[];
	chat_tags: Tag[];
	is_failed: boolean;
	resend_payload?: CreateMessageRequest;
	reactions?: Message[];
	assignment_event?: ChatAssignment;
	tagging_event?: ChatTagging;
	forwarded?: boolean;
	context?: Message;
}

export interface WabaPayload {
	id: string;
	from?: string;
	type: MessageType;
	timestamp: string;
	to?: string;
	wa_id?: string;
	recipient_type?: string;
	verify_contact?: boolean;
	text?: Text;
	template?: Template;
	button?: Button;
	video?: Video;
	image?: Image;
	audio?: Audio;
	voice?: Voice;
	document?: Document;
	location?: Location;
	order?: any;
	contacts?: any[];
	messaging_product?: string;
	interactive?: Interactive;
	sticker?: Sticker;
	reaction?: Reaction;
	errors?: ChatMessageError[];
	referral?: any;
	context?: WabaPayloadContext;
}

export interface ChatMessageError {
	title?: string;
	code?: number;
	details?: string;
	href?: string;
	recommendation?: string;
}

export interface WabaPayloadContext {
	id: string;
	from: string;
}

export interface Text {
	body: string;
}

export interface Video {
	id: string;
	mime_type?: string;
	link?: string;
	caption?: string;
}

export interface Image {
	id: string;
	mime_type?: string;
	link?: string;
	caption?: string;
}

export interface Audio {
	id: string;
	mime_type?: string;
	link?: string;
	caption?: string;
}

export interface Voice {
	id: string;
	mime_type?: string;
	link?: string;
	caption?: string;
}

export interface Document {
	id: string;
	mime_type?: string;
	link?: string;
	filename?: string;
	caption?: string;
}

export interface Location {
	latitude: number;
	longitude: number;
	name?: string;
	address?: string;
}

export interface Interactive {
	type: string;
	header?: any;
	body?: Body;
	footer?: any;
	nfm_reply?: any;
	action?: Action;
	button_reply?: ButtonReply;
	list_reply?: any;
}

export interface Reaction {
	emoji: string;
	message_id: string;
}

export interface Body {
	text: string;
}

export interface Action {
	name: string;
	buttons?: Button[];
	parameters?: {
		url?: string;
		display_text?: string;
		flow_cta?: string;
	};
	sections?: any[];
	catalog_id?: string;
	product_retailer_id?: string;
}

export interface Button {
	type: string;
	text?: string;
	reply: Reply;
}

export interface ButtonReply {
	title: string;
}

export interface Reply {
	id: string;
	title: string;
}

export interface Sticker {
	id: string;
	link?: string;
	sha256: string;
	animated: boolean;
	mime_type: string;
}

export interface WabaStatuses {
	sent?: number;
	delivered?: number;
	read?: number;
}

export interface Profile {
	name: string;
}

export interface Permissions {
	can_use_tags: boolean;
	can_read_chats: string;
	can_write_to_chats: string;
}

export interface WebhookMessage {
	type: string;
	waba_payload?: WebhookMessageWabaPayload;
}

export interface WebhookMessageWabaPayload {
	incoming_messages?: Message[];
	outgoing_messages?: Message[];
	statuses?: WebhookMessageStatus[];
	chat_assignment?: ChatAssignment;
	chat_tagging?: ChatTagging;
	bulk_message_tasks?: any[];
	bulk_message_task_elements?: any[];
}

export interface ChatAssignment {
	assigned_group_set?: Group;
	assigned_group_was_cleared: boolean;
	assigned_to_user_set?: User;
	assigned_to_user_was_cleared: boolean;
	done_by?: User;
	timestamp: number;
	wa_id: string;
}

export interface ChatTagging {
	timestamp: number;
	action: 'added' | 'removed';
	tag: Tag;
	chat: string;
	extra: any;
	done_by?: User;
}

export interface WebhookMessageStatus {
	id: string;
	getchat_id: string;
	recipient_id: string;
	status: MessageStatus;
	errors: ChatMessageError[];
	timestamp: string;
}

export enum MessageType {
	none = 'none',
	text = 'text',
	image = 'image',
	video = 'video',
	voice = 'voice',
	audio = 'audio',
	document = 'document',
	sticker = 'sticker',
	location = 'location',
	template = 'template',
	button = 'button',
	interactive = 'interactive',
	order = 'order',
	contacts = 'contacts',
	reaction = 'reaction',
}

export enum MessageStatus {
	pending = 'pending',
	sent = 'sent',
	delivered = 'delivered',
	read = 'read',
}
