export const BASE_URL = process.env.REACT_APP_BASE_URL.trim();

export const EVENT_TOPIC_CHAT_MESSAGE = "chat_message";
export const EVENT_TOPIC_GO_TO_MSG_ID = "go_to_msg_id";
export const EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY = "search_messages_visibility";
export const EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY = "contact_details_visibility";
export const EVENT_TOPIC_EMOJI_PICKER_VISIBILITY = "emoji_picker_visibility";
export const EVENT_TOPIC_DROPPED_FILES = "dropped_files";
export const EVENT_TOPIC_RELOAD_PREVIEW = "reload_preview";
export const EVENT_TOPIC_NEW_CHAT_MESSAGES = "new_chat_messages";
export const EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE = "chat_message_status_change";
export const EVENT_TOPIC_MARKED_AS_SEEN = "marked_as_seen";
export const EVENT_TOPIC_REQUEST_MIC_PERMISSION = "request_mic_permission";

export const EMOJI_SET = 'facebook';
export const EMOJI_SHEET_SIZE = 64;

export const ATTACHMENT_TYPE_IMAGE = 'image';
export const ATTACHMENT_TYPE_VIDEO = 'video';
export const ATTACHMENT_TYPE_AUDIO = 'audio';
export const ATTACHMENT_TYPE_DOCUMENT = 'document';

export const EMPTY_IMAGE_BASE64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const CALENDAR_NORMAL = {
    lastDay: '[Yesterday at] LT',
    sameDay: '[Today at] LT',
    lastWeek: 'dddd [at] LT',
    sameElse: 'MMMM d, yyyy'
};

export const CALENDAR_SHORT = {
    lastDay: '[Yesterday]',
    sameDay: 'LT',
    lastWeek: 'dddd',
    sameElse: 'MMM d, yyyy'
};

export const CALENDAR_SHORT_DAYS = {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    lastWeek: 'dddd',
    sameElse: 'MMMM d, yyyy'
};