import UIReducer from './UIReducer';
import chatsReducer from './chatsReducer';
import templatesReducer from './templatesReducer';
import savedResponsesReducer from './savedResponsesReducer';
import usersReducer from './usersReducer';
import currentUserReducer from './currentUserReducer';
import currentTenantReducer from './currentTenantReducer';
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
import isUserAvailableReducer from '@src/store/reducers/isUserAvailableReducer';
import isUserAvailabilityFeatureEnabledReducer from '@src/store/reducers/isUserAvailabilityFeatureEnabledReducer';
import inboxesReducer from '@src/store/reducers/inboxesReducer';
import brandingReducer from '@src/store/reducers/brandingReducer';

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
	currentTenant: currentTenantReducer,
	groups: groupsReducer,
	filterTagId: filterTagIdReducer,
	chatsCount: chatsCountReducer,
	previewMediaObject: previewMediaObjectReducer,
	isRefreshingTemplates: isRefreshingTemplatesReducer,
	currentChatTags: currentChatTagsReducer,
	waId: waIdReducer,
	phoneNumber: phoneNumberReducer,
	isUserAvailable: isUserAvailableReducer,
	isUserAvailabilityFeatureEnabled: isUserAvailabilityFeatureEnabledReducer,
	inboxes: inboxesReducer,
	branding: brandingReducer,
};

export default rootReducer;
