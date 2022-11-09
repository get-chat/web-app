import UIReducer from './UIReducer';
import templatesReducer from './templatesReducer';
import currentUserReducer from './currentUserReducer';

const rootReducer = {
	UI: UIReducer,
	templates: templatesReducer,
	currentUser: currentUserReducer,
};

export default rootReducer;
