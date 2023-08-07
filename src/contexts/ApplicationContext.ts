import React from 'react';
import { ApiService } from '@src/api/ApiService';

interface Props {
	apiService: ApiService;
}

const ApplicationContext = React.createContext<Props>({
	apiService: new ApiService({}),
});

export { ApplicationContext };
