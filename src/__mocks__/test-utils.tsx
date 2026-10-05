import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { TooltipProvider } from '@src/components/ui/tooltip';

const mockConfig = {
	API_BASE_URL: 'http://test-api.com',
	REACT_APP_LOGO_URL: '/logo.png',
};

export const TestProviders = ({ children }: { children: React.ReactNode }) => (
	<AppConfigContext.Provider
		// @ts-ignore
		value={mockConfig}
	>
		<TooltipProvider>
			<MemoryRouter>{children}</MemoryRouter>
		</TooltipProvider>
	</AppConfigContext.Provider>
);
