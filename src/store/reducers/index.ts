import UIReducer from './UIReducer';
import chatsReducer from './chatsReducer';
import templatesReducer from './templatesReducer';
import savedResponsesReducer from './savedResponsesReducer';
import usersReducer from './usersReducer';
import currentUserReducer from './currentUserReducer';
import groupsReducer from './groupsReducer';
import filterTagIdReducer from './filterTagIdReducer';
import chatsCountReducer from './chatsCountReducer';
import tagsReducer from './tagsReducer';
import previewMediaObjectReducer from './previewMediaObjectReducer';
import isRefreshingTemplatesReducer from './isRefreshingTemplatesReducer';
import pendingMessagesReducer from './pendingMessagesReducer';
import newMessagesReducer from './newMessagesReducer';
import currentChatTagsReducer from './currentChatTagsReducer';
import waIdReducer from './waIdReducer';
import phoneNumberReducer from '@src/store/reducers/phoneNumberReducer';

const rootReducer = {
	UI: UIReducer,
	chats: chatsReducer,
	templates: templatesReducer,
	newMessages: newMessagesReducer,
	pendingMessages: pendingMessagesReducer,
	savedResponses: savedResponsesReducer,
	tags: tagsReducer,
	users: usersReducer,
	currentUser: currentUserReducer,
	groups: groupsReducer,
	filterTagId: filterTagIdReducer,
	chatsCount: chatsCountReducer,
	previewMediaObject: previewMediaObjectReducer,
	isRefreshingTemplates: isRefreshingTemplatesReducer,
	currentChatTags: currentChatTagsReducer,
	waId: waIdReducer,
	phoneNumber: phoneNumberReducer,
};

export default rootReducer;
