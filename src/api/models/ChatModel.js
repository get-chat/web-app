import { getPastHoursByTimestamp } from '../../helpers/DateHelper';
import { generateInitialsHelper, sanitize } from '../../helpers/Helpers';

class ChatModel {
	constructor(data) {
		const contact = data.contact;
		const lastMessage = data.last_message;
		const contactPayload = contact.waba_payload;
		const lastMessagePayload = lastMessage?.waba_payload;

		this.waId = contactPayload.wa_id;

		this.setName(contactPayload.profile.name);

		this.newMessages = data.new_messages;

		this.lastReceivedMessageTimestamp = parseInt(
			contact.last_message_timestamp
		);

		this.setLastMessage(lastMessagePayload);

		// Use last message timestamp from contact object, if last message does not exist
		this.lastMessageTimestamp = this.lastMessageTimestamp
			? this.lastMessageTimestamp
			: parseInt(contact.last_message_timestamp);

		this.assignedGroup = data.assigned_group;
		this.assignedToUser = data.assigned_to_user;
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

	setName(name) {
		this.name = name;
		this.initials = this.generateInitials();
	}

	generateInitials = () => {
		return generateInitialsHelper(this.name);
	};

	setLastMessage(lastMessagePayload) {
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
		this.lastMessageTimestamp = parseInt(this.lastMessage?.timestamp);
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

	generateAssignmentInformation() {
		let info = '';
		if (this.assignedToUser) {
			info = 'Assigned to: ' + this.assignedToUser.username;
		}

		if (this.assignedGroup) {
			if (info) {
				info += ', ';
			}

			info += 'Assigned group: ' + this.assignedGroup.name;
		}

		return info;
	}
}

export default ChatModel;
