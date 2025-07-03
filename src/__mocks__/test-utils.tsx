import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { AppConfigContext } from '@src/contexts/AppConfigContext';

const theme = createTheme();

const mockConfig = {
	API_BASE_URL: 'http://test-api.com',
	REACT_APP_LOGO_URL: '/logo.png',
};

export const TestProviders = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider theme={theme}>
		<AppConfigContext.Provider
			// @ts-ignore
			value={mockConfig}
		>
			<MemoryRouter>{children}</MemoryRouter>
		</AppConfigContext.Provider>
	</ThemeProvider>
);
