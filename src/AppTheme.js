import {createMuiTheme} from "@material-ui/core/styles";

const AppTheme = createMuiTheme({
    palette: {
        primary: {
            main: '#009688'
        },
        secondary: {
            main: '#E33E7F'
        }
    },
    typography: {
        fontFamily: [
            'Inter',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
        ].join(','),
    }
});

export default AppTheme;