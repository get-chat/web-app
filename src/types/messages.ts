import { Contact } from '@src/types/contacts';
import { Tag } from '@src/types/tags';
import { Group } from '@src/types/groups';
import { Template } from '@src/types/templates';

export interface Message {
	id: string;
	waba_payload: WabaPayload;
	waba_statuses: WabaStatuses;
	contact: Contact;
	from_us: boolean;
	received: boolean;
	sender?: Sender;
	context: any;
	customer_wa_id: string;
	tags: any[];
	chat_tags: Tag[];
}

export interface WabaPayload {
	id: string;
	from?: string;
	type: string;
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
	document?: Document;
	messaging_product?: string;
	interactive?: Interactive;
	sticker?: Sticker;
	reaction?: Reaction;
}

export interface Text {
	body: string;
}

export interface Video {
	caption?: string;
}

export interface Image {
	caption?: string;
}

export interface Audio {
	caption?: string;
}

export interface Document {
	caption?: string;
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
