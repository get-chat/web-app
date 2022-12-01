import { createTheme } from '@mui/material';

const AppTheme = createTheme({
	palette: {
		primary: {
			main: '#65cbac',
		},
		secondary: {
			main: '#E33E7F',
		},
		black: {
			main: '#212329',
			contrastText: '#fff',
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
	components: {
		MuiMenuItem: {
			defaultProps: {
				dense: true,
			},
		},
	},
});

export default AppTheme;
