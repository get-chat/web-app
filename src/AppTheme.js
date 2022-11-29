import { createTheme, adaptV4Theme } from '@mui/material/styles';

const AppTheme = createTheme(
	adaptV4Theme({
		palette: {
			primary: {
				main: '#65cbac',
			},
			secondary: {
				main: '#E33E7F',
			},
		},
		typography: {
			fontFamily: [
				'Inter',
				'Roboto',
				'"Helvetica Neue"',
				'Arial',
				'sans-serif',
			].join(','),
		},
	})
);

export default AppTheme;
