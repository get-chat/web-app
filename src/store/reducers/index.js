import UIReducer from './UIReducer';
import templatesReducer from './templatesReducer';
import currentUserReducer from './currentUserReducer';
import filterTagReducer from './filterTagReducer';
import chatsCountReducer from './chatsCountReducer';

const rootReducer = {
	UI: UIReducer,
	templates: templatesReducer,
	currentUser: currentUserReducer,
	filterTag: filterTagReducer,
	chatsCount: chatsCountReducer,
};

export default rootReducer;
