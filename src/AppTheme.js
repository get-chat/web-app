import { createTheme } from '@mui/material';

const AppTheme = createTheme({
	palette: {
		primary: {
			main: '#65cbac',
		},
		secondary: {
			main: '#E33E7F',
		},
	},
	typography: {
		button: {
			textTransform: 'none',
		},
		fontFamily: [
			'Inter',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
		].join(','),
	},
});

export default AppTheme;
