import {
	ATTACHMENT_TYPE_DOCUMENT,
	ATTACHMENT_TYPE_IMAGE,
	ATTACHMENT_TYPE_VIDEO,
} from '../Constants';
import ChosenFileClass from '@src/ChosenFileClass';
import { Template } from '@src/types/templates';
import { Chat } from '@src/types/chats';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import { User } from '@src/types/users';
import { getPastHoursByTimestamp } from '@src/helpers/DateHelper';
import { MessageType } from '@src/types/messages';

export const isChatExpired = (chat: Chat | undefined) =>
	getPastHoursByTimestamp(chat?.contact.last_message_timestamp ?? 0) >= 24;

export const getChatContactName = (chat: Chat | undefined) =>
	chat?.contact.waba_payload.profile.name;

export const setChatContactName = (
	chat: Chat | undefined,
	name: string | undefined
) => {
	if (chat && !!name) {
		// Make data mutable
		chat.contact.waba_payload.profile = {
			...chat.contact.waba_payload.profile,
		};
		chat.contact.waba_payload.profile.name = name;
	}
};

export const getLastMessageTimestamp = (chat: Chat | undefined) =>
	parseIntSafely(chat?.last_message?.waba_payload?.timestamp) ??
	chat?.contact.last_message_timestamp;

export const getLastIncomingMessageTimestamp = (chat: Chat | undefined) =>
	chat?.contact.last_message_timestamp;

export const isLastMessageOutgoing = (chat: Chat | undefined) =>
	chat?.last_message?.waba_payload?.hasOwnProperty('to') ?? false;

export const isChatAssignedToUser = (chat: Chat | undefined, user: User) =>
	chat?.assigned_to_user?.id == user.id;

export const isChatAssignedToUserAnyGroup = (
	chat: Chat | undefined,
	user: User
) => {
	const matchedGroup = user.groups.filter(
		(group) => group.id === chat?.assigned_group?.id
	);
	return Boolean(matchedGroup);
};

export const isChatAssignedToGroupId = (
	chat: Chat | undefined,
	groupId: number
) => chat?.assigned_to_user?.id == groupId;

export const isChatIncludingTagId = (chat: Chat | undefined, tagId: number) => {
	const result = chat?.tags.find((item) => item.id === tagId);
	return Boolean(result);
};

export const generateTemplateMessagePayload = (
	templateMessage: Template
): any => {
	return {
		type: MessageType.template,
		template: {
			namespace: templateMessage.namespace,
			name: templateMessage.name,
			language: {
				code: templateMessage.language,
				policy: 'deterministic',
			},
			components: templateMessage.params,
		},
	};
};

export const prepareSendFilePayload = (
	chosenFile: ChosenFileClass,
	fileURL: string | undefined | null
) => {
	const { caption, attachmentType, file } = chosenFile;
	const filename = file.name;
	const mimeType = file.type;

	let requestBody: { [key: string]: any } = {
		type: attachmentType,
	};

	requestBody[attachmentType] = {
		link: fileURL,
		mime_type: mimeType,
	};

	// caption param is accepted for only images and videos
	if (
		attachmentType === ATTACHMENT_TYPE_IMAGE ||
		attachmentType === ATTACHMENT_TYPE_VIDEO
	) {
		requestBody[attachmentType]['caption'] = caption;
	}

	// filename param is accepted for documents
	if (attachmentType === ATTACHMENT_TYPE_DOCUMENT) {
		requestBody[attachmentType]['filename'] = filename;
	}

	return requestBody;
};
