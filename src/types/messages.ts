import { Contact } from '@src/types/contacts';
import { Tag } from '@src/types/tags';
import { Group } from '@src/types/groups';
import { Template } from '@src/types/templates';

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
	type?: string;
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
	sender?: Sender;
	customer_wa_id: string;
	tags: any[];
	chat_tags: Tag[];
	is_failed: boolean;
	resend_payload?: CreateMessageRequest;
	reactions?: Message[];
	assignment_event?: any;
	tagging_event?: any;
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
	errors?: any[];
	referral: any;
	context?: WabaPayloadContext;
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
	body: Body;
	type: string;
	action: Action;
	button_reply: ButtonReply;
}

export interface Reaction {
	emoji: string;
	message_id: string;
}

export interface Body {
	text: string;
}

export interface Action {
	buttons: Button[];
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

export interface Sender {
	url: string;
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	profile: Profile;
	groups: Group[];
	permissions: Permissions;
}

export interface Profile {
	name: string;
}

export interface Permissions {
	can_use_tags: boolean;
	can_read_chats: string;
	can_write_to_chats: string;
}

export enum MessageType {
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
