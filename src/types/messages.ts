import { Tag } from '@src/types/tags';
import { Template } from '@src/types/templates';
import { User, UserAvailabilityEvent } from '@src/types/users';
import { Person } from '@src/types/persons';
import { ChatAssignmentEvent } from '@src/types/chatAssignment';
import UserAvailability from '@src/components/UserAvailability';

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
	reaction?: Reaction;
	location?: Location;
	pending_message_unique_id?: string;
}

export interface CreateMessageResponse {
	reason: string;
	id: string;
}

export interface Message {
	id: string;
	waba_payload?: MessageWabaPayload;
	waba_statuses?: WabaStatuses;
	contact?: Person;
	from_us: boolean;
	received: boolean;
	sender?: User;
	customer_wa_id: string;
	tags: any[];
	chat_tags: Tag[];
	is_failed: boolean;
	resend_payload?: CreateMessageRequest;
	reactions?: Message[];
	assignment_event?: ChatAssignmentEvent;
	tagging_event?: ChatTagging;
	forwarded?: boolean;
	context?: Message;
	// Client-side only: set for messages delivered via message echo webhook
	// events (sent outside get.chat), derived from the webhook change field
	echo_origin?: MessageEchoOrigin;
}

// Where an echoed outgoing message was sent from, based on the webhook
// change field: message_echoes (API) or smb_message_echoes (WhatsApp
// Business app / Coexistence)
export enum MessageEchoOrigin {
	api = 'api',
	smb = 'smb',
}

export interface MessageWabaPayload {
	id: string;
	from?: string;
	// Business-Scoped User ID of the sender; the only sender identifier present
	// when the contact hides their phone number (BSUID-only contacts).
	from_user_id?: string;
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
	url?: string;
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

export interface Permissions {
	can_use_tags: boolean;
	can_read_chats: string;
	can_write_to_chats: string;
}

export interface LegacyWabaWebhook {
	type: string;
	waba_payload?: LegacyWabaWebhookWabaPayload;
}

export interface LegacyWabaWebhookWabaPayload {
	incoming_messages?: Message[];
	outgoing_messages?: Message[];
	statuses?: WebhookMessageStatus[];
	chat_assignment?: ChatAssignmentEvent;
	chat_tagging?: ChatTagging;
	chat_resolved?: ChatResolvedEvent;
	user_availability?: UserAvailabilityEvent;
}

export interface ChatTagging {
	timestamp: number;
	action: 'added' | 'removed';
	tag: Tag;
	chat: string;
	extra: any;
	done_by?: User;
}

export interface ChatResolvedEvent {
	resolved: boolean;
	wa_id: string;
}

export interface WebhookMessageStatus {
	id: string;
	getchat_id: string;
	recipient_id: string;
	status: MessageStatus;
	errors: ChatMessageError[];
	conversation?: {
		id: string;
		origin: {
			type: string;
		};
	};
	pricing?: {
		billable: boolean;
		pricing_model: string;
		category: string;
		type: string;
	};
	timestamp: string;
}

export interface MarkAsReceivedRequest {
	customer_wa_id: string;
	timestamp: number;
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
