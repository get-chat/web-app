import { getPastHoursByTimestamp } from '@src/helpers/DateHelper';
import { generateInitialsHelper, sanitize } from '@src/helpers/Helpers';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { User } from '@src/types/users';
import { Tag } from '@src/types/tags';
import { Group } from '@src/types/groups';

class ChatModel {
	public waId: string;
	public name?: string;
	public initials?: string;
	public tags: Tag[];
	public assignedToUser?: User;
	public assignedGroup?: Group;
	public lastMessageTimestamp: number = 0;
	public lastReceivedMessageTimestamp: number;
	public isExpired: boolean = true;

	public lastMessageType?: string;
	public lastMessage?: ChatMessageModel | any;
	public lastMessageButtonText?: string;
	public interactiveButtonText?: string;
	public lastMessageBody?: string;
	public lastMessageCaption?: string;
	public isLastMessageFromUs: boolean = false;
	public lastMessageInteractiveButtonText?: string;
	public newMessages: number;

	constructor(data: any) {
		const contact = data.contact;
		const lastMessage = data.last_message;
		const contactPayload = contact.waba_payload;
		const lastMessagePayload = lastMessage?.waba_payload;

		this.waId = contactPayload.wa_id;

		this.setName(contactPayload.profile.name);

		this.newMessages = data.new_messages;

		this.lastReceivedMessageTimestamp =
			parseIntSafely(contact.last_message_timestamp) ?? 0;

		this.setLastMessage(lastMessagePayload);

		// Use last message timestamp from contact object, if last message does not exist
		this.lastMessageTimestamp = this.lastMessageTimestamp
			? this.lastMessageTimestamp
			: this.lastReceivedMessageTimestamp;

		if (data.assigned_group) {
			this.assignedGroup = data.assigned_group;
		}

		if (data.assigned_to_user) {
			this.assignedToUser = data.assigned_to_user;
		}

		this.tags = data.tags;

		// Not need to sanitize this, because it is already sanitized
		// this.sanitize();
	}

	sanitize() {
		this.name = sanitize(this.name);
		this.lastMessageBody = sanitize(this.lastMessageBody);
		this.lastMessageButtonText = sanitize(this.lastMessageButtonText);
		this.lastMessageInteractiveButtonText = sanitize(
			this.lastMessageInteractiveButtonText
		);
		this.lastMessageCaption = sanitize(this.lastMessageCaption);
	}

	setName(name: string | undefined) {
		this.name = name;
		this.initials = this.generateInitials();
	}

	generateInitials = () => {
		return generateInitialsHelper(this.name);
	};

	setLastMessage(lastMessagePayload: any) {
		this.lastMessage = lastMessagePayload;
		this.lastMessageBody = this.lastMessage?.text?.body;
		this.lastMessageButtonText = lastMessagePayload?.button?.text;
		this.lastMessageInteractiveButtonText =
			lastMessagePayload?.interactive?.button_reply?.title;
		this.lastMessageCaption =
			lastMessagePayload?.image?.caption ??
			lastMessagePayload?.video?.caption ??
			lastMessagePayload?.audio?.caption ??
			lastMessagePayload?.document?.caption;
		this.lastMessageType = lastMessagePayload?.type;
		this.lastMessageTimestamp =
			parseIntSafely(this.lastMessage?.timestamp) ?? 0;
		this.isLastMessageFromUs = lastMessagePayload?.hasOwnProperty('to');

		if (this.lastMessage?.hasOwnProperty('from')) {
			this.lastReceivedMessageTimestamp = this.lastMessageTimestamp;
		}

		this.isExpired = this.checkIfExpired();
	}

	getPastHoursAfterLastMessage() {
		return getPastHoursByTimestamp(this.lastReceivedMessageTimestamp);
	}

	checkIfExpired() {
		return this.getPastHoursAfterLastMessage() >= 24;
	}

	getAssignedUserUsername() {
		return this.assignedToUser?.username;
	}

	generateAssignedToInitials() {
		return this.assignedToUser?.username?.[0]?.toUpperCase();
	}

	isAssignedToUser(user: User) {
		return this.assignedToUser && this.assignedToUser.id === user.id;
	}

	isAssignedToGroup(groupId: number) {
		return this.assignedGroup && this.assignedGroup.id === groupId;
	}

	isAssignedToUserAnyGroup(user: User) {
		const matchedGroup = user.groups.filter(
			(group) => group.id === this.assignedGroup?.id
		);
		return Boolean(matchedGroup);
	}

	hasTag(tagId: number) {
		const tag = this.tags.find((tag) => tag.id === tagId);
		return Boolean(tag);
	}
}

export default ChatModel;
