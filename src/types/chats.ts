import { Contact } from '@src/types/contacts';
import { Tag } from '@src/types/tags';
import { Message } from '@src/types/messages';
import { User } from '@src/types/users';

export interface Chat {
	contact: Contact;
	new_messages: number;
	wa_id: string;
	last_message: Message;
	assigned_to_user?: User;
	assigned_group: any;
	tags: Tag[];
}

export interface Profile {
	name: string;
}
