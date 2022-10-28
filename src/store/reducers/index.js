import UIReducer from './UIReducer';
import templatesReducer from './templatesReducer';

const rootReducer = {
	UI: UIReducer,
	templates: templatesReducer,
};

export default rootReducer;
