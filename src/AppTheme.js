import { createTheme } from '@mui/material/styles';

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
