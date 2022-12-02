import UIReducer from './UIReducer';
import templatesReducer from './templatesReducer';
import currentUserReducer from './currentUserReducer';
import filterTagReducer from './filterTagReducer';
import chatsCountReducer from './chatsCountReducer';
import tagsReducer from './tagsReducer';
import previewMediaObjectReducer from './previewMediaObjectReducer';

const rootReducer = {
	UI: UIReducer,
	templates: templatesReducer,
	tags: tagsReducer,
	currentUser: currentUserReducer,
	filterTag: filterTagReducer,
	chatsCount: chatsCountReducer,
	previewMediaObject: previewMediaObjectReducer,
};

export default rootReducer;
