import { TFunction } from 'i18next';
import { Chat } from '@src/types/chats';
import { Message } from '@src/types/messages';
import {
	GroupParticipantRef,
	WhatsAppGroup,
	WhatsAppGroupDetail,
	WhatsAppGroupIneligibilityReason,
	WhatsAppGroupJoinApprovalMode,
	WhatsAppGroupStatus,
} from '@src/types/whatsappGroups';
import { addPlus } from '@src/helpers/PhoneNumberHelper';

export const WHATSAPP_GROUP_SUBJECT_MAX_LENGTH = 128;
export const WHATSAPP_GROUP_DESCRIPTION_MAX_LENGTH = 2048;
// The Cloud API's limit, used until the API says otherwise (max_participants)
export const WHATSAPP_GROUP_MAX_PARTICIPANTS = 8;

export const WHATSAPP_GROUP_PICTURE_MIN_SIZE = 192;
export const WHATSAPP_GROUP_PICTURE_MAX_BYTES = 5 * 1024 * 1024;

export const isWhatsAppGroupChat = (chat: Chat | undefined) =>
	Boolean(chat?.is_group);

/** Messages can be sent to the group: not while it is created, suspended or deleted */
export const canSendToWhatsAppGroup = (
	group: WhatsAppGroup | undefined | null
) => group?.status === 'active';

/** The group can be read live from WhatsApp: active, or suspended (which may be lifted) */
export const isWhatsAppGroupReadable = (
	group: WhatsAppGroup | undefined | null
) => group?.status === 'active' || group?.status === 'suspended';

export const getWhatsAppGroupParticipantCount = (
	group: WhatsAppGroupDetail | undefined
) => group?.total_participant_count ?? group?.participants?.length;

export const getWhatsAppGroupMaxParticipants = (
	group: WhatsAppGroup | undefined
) => group?.max_participants || WHATSAPP_GROUP_MAX_PARTICIPANTS;

/** Places left in the group, or undefined while the participants are unknown */
export const getRemainingParticipantSlots = (
	group: WhatsAppGroupDetail | undefined
) => {
	const count = getWhatsAppGroupParticipantCount(group);
	if (count === undefined) return undefined;
	return Math.max(0, getWhatsAppGroupMaxParticipants(group) - count);
};

export const isWhatsAppGroupFull = (group: WhatsAppGroupDetail | undefined) =>
	getRemainingParticipantSlots(group) === 0;

/** Approving this many join requests would not go over the limit */
export const canApproveJoinRequests = (
	group: WhatsAppGroupDetail | undefined,
	numberOfRequests: number
) => {
	const remaining = getRemainingParticipantSlots(group);
	return remaining !== undefined && numberOfRequests <= remaining;
};

export const getGroupParticipantKey = (
	participant: GroupParticipantRef | undefined | null
) => participant?.wa_id ?? participant?.user_id ?? '';

export const getGroupParticipantName = (
	participant: GroupParticipantRef | undefined | null
) =>
	participant?.name ||
	(participant?.wa_id ? addPlus(participant.wa_id) : undefined) ||
	participant?.username ||
	participant?.user_id ||
	'';

// Readable on a white bubble, like WhatsApp's own sender names
const PARTICIPANT_COLORS = [
	'#1f7aec',
	'#d6336c',
	'#2b8a3e',
	'#e8590c',
	'#7048e8',
	'#0c8599',
	'#c2255c',
	'#5c940d',
	'#9c36b5',
	'#b35c00',
];

/** Each participant's name keeps one colour, picked from their number */
export const getGroupParticipantColor = (
	participant: GroupParticipantRef | undefined | null
) => {
	const key = getGroupParticipantKey(participant);
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = (Math.imul(hash, 31) + key.charCodeAt(i)) | 0;
	}
	return PARTICIPANT_COLORS[Math.abs(hash) % PARTICIPANT_COLORS.length];
};

/** Who sent an inbound group message: the API's field, else the raw payload */
export const getMessageGroupParticipant = (
	message: Message | undefined
): GroupParticipantRef | undefined => {
	if (!message || message.from_us) return undefined;
	if (message.group_participant) return message.group_participant;
	if (!message.waba_payload?.group_id) return undefined;
	return {
		wa_id: message.waba_payload.from,
		user_id: message.waba_payload.from_user_id,
	};
};

export const getJoinApprovalModeLabel = (
	mode: WhatsAppGroupJoinApprovalMode | undefined,
	t: TFunction
) =>
	mode === 'approval_required'
		? t('Approval required')
		: t('Anyone with the link');

/** The badge of a group that cannot be written to, if any */
export const getWhatsAppGroupStatusLabel = (
	status: WhatsAppGroupStatus | undefined,
	t: TFunction
) => {
	switch (status) {
		case 'creating':
			return t('Creating');
		case 'create_failed':
			return t('Failed');
		case 'suspended':
			return t('Suspended');
		case 'deleted':
			return t('Deleted');
		default:
			return undefined;
	}
};

/** Why the composer of a group chat is off */
export const getWhatsAppGroupComposerNotice = (
	status: WhatsAppGroupStatus | undefined,
	t: TFunction
) => {
	switch (status) {
		case 'creating':
			return t('The group is being created. You can write once it is ready.');
		case 'create_failed':
			return t('This group could not be created, so messages cannot be sent.');
		case 'suspended':
			return t('WhatsApp suspended this group, so messages cannot be sent.');
		case 'deleted':
			return t('This group was deleted, so messages cannot be sent.');
		default:
			return undefined;
	}
};

export const getEligibilityReasonText = (
	reason: WhatsAppGroupIneligibilityReason | null | undefined,
	t: TFunction
) => {
	switch (reason) {
		case 'not_cloud_api':
			return t('Groups are only available on the Cloud API.');
		case 'not_oba':
			return t(
				'Groups are only available to Official Business Accounts (green tick).'
			);
		case 'coexistence':
			return t(
				'Groups are not available for numbers that also use the WhatsApp Business app (Coexistence).'
			);
		case 'limit_reached':
			return t('This number has reached the limit of 10,000 groups.');
		default:
			return undefined;
	}
};

/** The API's readable `detail`, or a fallback */
export const getWhatsAppGroupErrorMessage = (
	error: any,
	fallback: string
): string => {
	const detail = error?.response?.data?.detail;
	return typeof detail === 'string' && detail.length > 0 ? detail : fallback;
};

const loadImageSize = (file: File) =>
	new Promise<{ width: number; height: number }>((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const image = new window.Image();
		image.onload = () => {
			resolve({ width: image.naturalWidth, height: image.naturalHeight });
			URL.revokeObjectURL(url);
		};
		image.onerror = () => {
			reject(new Error('Unreadable image'));
			URL.revokeObjectURL(url);
		};
		image.src = url;
	});

/**
 * Checks a group picture before it is uploaded: WhatsApp takes a square
 * JPEG of at least 192px, up to 5 MB. Returns the problem, or undefined.
 */
export const validateWhatsAppGroupPicture = async (
	file: File,
	t: TFunction,
	getImageSize: (file: File) => Promise<{
		width: number;
		height: number;
	}> = loadImageSize
): Promise<string | undefined> => {
	if (file.type !== 'image/jpeg') {
		return t('The group picture must be a JPEG image.');
	}
	if (file.size > WHATSAPP_GROUP_PICTURE_MAX_BYTES) {
		return t('The group picture must be 5 MB or smaller.');
	}
	try {
		const { width, height } = await getImageSize(file);
		if (width !== height) {
			return t('The group picture must be square.');
		}
		if (width < WHATSAPP_GROUP_PICTURE_MIN_SIZE) {
			return t('The group picture must be at least 192 × 192 pixels.');
		}
	} catch {
		return t('This image could not be read.');
	}
	return undefined;
};
