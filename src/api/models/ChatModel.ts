// @ts-nocheck
import { getPastHoursByTimestamp } from '@src/helpers/DateHelper';
import { generateInitialsHelper, sanitize } from '@src/helpers/Helpers';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import UserModel from '@src/api/models/UserModel';
import GroupModel from '@src/api/models/GroupModel';
import TagModel from '@src/api/models/TagModel';

class ChatModel {
	public waId: string;
	public name?: string;
	public tags: TagModel[];
	public assignedToUser?: UserModel;
	public assignedGroup?: GroupModel;
	public lastMessageTimestamp: number;
	public lastReceivedMessageTimestamp: number;

	constructor(data: any) {
		const contact = data.contact;
		const lastMessage = data.last_message;
		const contactPayload = contact.waba_payload;
		const lastMessagePayload = lastMessage?.waba_payload;

		this.waId = contactPayload.wa_id;

		this.setName(contactPayload.profile.name);

		this.newMessages = data.new_messages;

		this.lastReceivedMessageTimestamp = parseIntSafely(
			contact.last_message_timestamp
		);

		this.setLastMessage(lastMessagePayload);

		// Use last message timestamp from contact object, if last message does not exist
		this.lastMessageTimestamp = this.lastMessageTimestamp
			? this.lastMessageTimestamp
			: this.lastReceivedMessageTimestamp;

		if (data.assigned_group) {
			this.assignedGroup = new GroupModel(data.assigned_group);
		}

		if (data.assigned_to_user) {
			this.assignedToUser = new UserModel(data.assigned_to_user);
		}

		this.tags = data.tags?.map((item: any) => new TagModel(item)) ?? [];

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
		this.lastMessageTimestamp = parseIntSafely(this.lastMessage?.timestamp);
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

	isAssignedToUser(user: UserModel) {
		return this.assignedToUser && this.assignedToUser.id === user.id;
	}

	isAssignedToGroup(groupId: number) {
		return this.assignedGroup && this.assignedGroup.id === groupId;
	}

	isAssignedToUserAnyGroup(user: UserModel) {
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
