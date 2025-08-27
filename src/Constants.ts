export const BreakException = {};
export const InvalidTemplateParamException = {};

export const CHAT_KEY_PREFIX = 'chat_';

export const CHAT_FILTER_PREFIX = 'cf_';

export const EVENT_TOPIC_FORCE_LOGOUT = 'force_logout';
export const EVENT_TOPIC_CHAT_MESSAGE = 'chat_message';
export const EVENT_TOPIC_GO_TO_MSG_ID = 'go_to_msg_id';
export const EVENT_TOPIC_EMOJI_PICKER_VISIBILITY = 'emoji_picker_visibility';
export const EVENT_TOPIC_DROPPED_FILES = 'dropped_files';
export const EVENT_TOPIC_RELOAD_PREVIEW = 'reload_preview';
export const EVENT_TOPIC_NEW_CHAT_MESSAGES = 'new_chat_messages';
export const EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE =
	'chat_message_status_change';
export const EVENT_TOPIC_POST_CHAT_MESSAGE_STATUS_CHANGE =
	'post_chat_message_status_change';
export const EVENT_TOPIC_MARKED_AS_RECEIVED = 'marked_as_received';
export const EVENT_TOPIC_REQUEST_MIC_PERMISSION = 'request_mic_permission';
export const EVENT_TOPIC_DISPLAY_ERROR = 'display_error';
export const EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR =
	'send_template_message_error';
export const EVENT_TOPIC_SENT_TEMPLATE_MESSAGE = 'sent_template_message';
export const EVENT_TOPIC_UPDATE_PERSON_NAME = 'update_person_name';
export const EVENT_TOPIC_CHAT_ASSIGNMENT = 'chat_assignment';
export const EVENT_TOPIC_CHAT_TAGGING = 'chat_tagging';
export const EVENT_TOPIC_UNSUPPORTED_FILE = 'unsupported_file';
export const EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT = 'clear_text_message_input';
export const EVENT_TOPIC_FORCE_REFRESH_CHAT = 'force_refresh_chat';
export const EVENT_TOPIC_FORCE_REFRESH_CHAT_LIST = 'force_refresh_chat_list';
export const EVENT_TOPIC_VOICE_RECORD_STARTING = 'voice_record_starting';
export const EVENT_TOPIC_FOCUS_MESSAGE_INPUT = 'focus_message_input';
export const EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO =
	'reload_business_profile_photo';

export const EMOJI_SET = 'facebook';
export const EMOJI_SHEET_SIZE = 64;

export const ATTACHMENT_TYPE_IMAGE = 'image';
export const ATTACHMENT_TYPE_VIDEO = 'video';
export const ATTACHMENT_TYPE_AUDIO = 'audio';
export const ATTACHMENT_TYPE_DOCUMENT = 'document';

export const EMPTY_IMAGE_BASE64 =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const CALENDAR_NORMAL = {
	lastDay: '[Yesterday at] H:mm', // LT
	sameDay: '[Today at] H:mm',
	lastWeek: 'dddd [at] H:mm',
	sameElse: 'MMMM D, yyyy',
};

export const CALENDAR_SHORT = {
	lastDay: '[Yesterday]',
	sameDay: 'H:mm',
	lastWeek: 'dddd',
	sameElse: 'MMM D, yyyy',
};

export const CALENDAR_SHORT_DAYS = {
	lastDay: '[Yesterday]',
	sameDay: '[Today]',
	lastWeek: 'dddd',
	sameElse: 'MMMM D, yyyy',
};

export const AXIOS_ERROR_CODE_TIMEOUT = 'ECONNABORTED';

export const CONTACTS_TEMP_LIMIT = 100;

export const FORM_VALIDATION_ERROR = 'FORM_VALIDATION_ERROR';

export const COMMAND_SAVED_RESPONSE = '/response';
export const COMMAND_SAVED_RESPONSE_ALIAS = '/r';

export const COMMAND_TEMPLATE = '/template';
export const COMMAND_TEMPLATE_ALIAS = '/t';

export const COMMAND_ASSIGN = '/assign';
export const COMMAND_ASSIGN_ALIAS = '/a';

export const COMMAND_SEARCH = '/search';
export const COMMAND_SEARCH_ALIAS = '/s';
