import UIReducer from './UIReducer';
import templatesReducer from './templatesReducer';

const rootReducer = {
	UI: UIReducer,
	template: templatesReducer,
};

export default rootReducer;
