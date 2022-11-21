import UIReducer from './UIReducer';
import templatesReducer from './templatesReducer';
import currentUserReducer from './currentUserReducer';
import filterTagReducer from './filterTagReducer';

const rootReducer = {
	UI: UIReducer,
	templates: templatesReducer,
	currentUser: currentUserReducer,
	filterTag: filterTagReducer,
};

export default rootReducer;
