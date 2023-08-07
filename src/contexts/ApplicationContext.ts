import React from 'react';
import { ApiService } from '@src/api/ApiService';

const ApplicationContext = React.createContext<{
	apiService: ApiService;
} | null>(null);

export { ApplicationContext };
