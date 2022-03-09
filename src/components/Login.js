import React, {useEffect, useState} from 'react';
import '../styles/Login.css';
import {Backdrop, CircularProgress, Fade, TextField} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {Alert} from "@material-ui/lab";
import {VERSION} from "../Constants";
import {clearToken, getToken, storeToken} from "../helpers/StorageHelper";
import {logoutCall} from "../api/ApiCalls";
import {makeStyles} from "@material-ui/styles";
import {useTranslation} from "react-i18next";
import {ApplicationContext} from "../contexts/ApplicationContext";

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

export default function Login(props) {

    const {apiService} = React.useContext(ApplicationContext);

    const { t, i18n } = useTranslation();

    const {errorCase} = useParams();

    const errorMessages = {
        "incorrectRole": "Only admins and users can access to our web app.",
        "notLoggedIn": "You are not logged in.",
        "invalidToken": "Invalid token."
    };

    const classes = useStyles();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setLoggingIn] = useState(false);
    const [isValidatingToken, setValidatingToken] = useState(false);
    const [loginError, setLoginError] = useState();

    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (errorCase) {
            setLoginError(errorMessages[errorCase]);

            if (errorCase === "invalidToken") {
                logoutToClearSession();
            }
        }

        const token = getToken();
        if (token) {
            setValidatingToken(true);

            apiService.baseCall((response) => {
                // Redirect to main route
                history.push("/main");
            }, (error) => {
                setValidatingToken(false);

                // TODO: Make sure the response is Unauthorized
                clearToken();
            });
        }
    }, []);

    const doLogin = async e => {
        e.preventDefault();

        // Check if username or password is empty
        if (username.trim() === '' || password.trim() === '') {
            // TODO: Display error on UI
            console.log("Empty credentials");
            return false;
        }

        // Display the loading animation
        setLoggingIn(true);

        apiService.loginCall(username, password,
            (response) => {
                // Store token in local storage
                storeToken(response.data.token);

                // Android web interface
                if (window.AndroidWebInterface) {
                    window.AndroidWebInterface.registerUserToken(response.data.token ?? "");
                }

                // Redirect to main route
                history.push((location.nextPath ?? "/main") + (location.search ?? ""));
            }, (error) => {
                // Hide the loading animation
                setLoggingIn(false);
                setLoginError(undefined);

                if (error.response) {
                    // Current status code for incorrect credentials must be changed to 401 or 403
                    if ([400, 401, 403].includes(error.response.status)) {
                        setLoginError("Incorrect username or password.");
                    } else {
                        setLoginError("An error has occurred. Please try again later.");
                    }
                }
            });
    }

    const logoutToClearSession = () => {
        logoutCall();
    }

    return (
        <div className="login">

            <Fade in={true}>
                <div className="login__body">
                    <div className="login__body__logoWrapper">
                        <img className="login__body__logo" src={process.env.REACT_APP_LOGO_URL ?? '/logo.png'} alt="Logo" />
                    </div>

                    <h2>{t('Welcome')}</h2>
                    <p>{t('Please login to start')}</p>

                    <form onSubmit={doLogin}>
                        <TextField value={username} onChange={e => setUsername(e.target.value)} label={t('Username')} size="medium" fullWidth={true} />
                        <TextField value={password} onChange={e => setPassword(e.target.value)} type="password" label={t('Password')} size="medium" fullWidth={true} />
                        <Button type="submit" color="primary" fullWidth={true} disableElevation>
                            {t('Log in')}
                        </Button>
                    </form>

                    {isValidatingToken &&
                    <div className="login__validatingToken">
                        <h2>{t('Welcome')}</h2>
                        <p>{t('We are validating your session, please wait.')}</p>
                    </div>
                    }

                    {loginError &&
                    <Alert severity="error">{t(loginError)}</Alert>
                    }

                    <div className="login__body__versionWrapper">
                        <span className="login__body__version">Version: { VERSION }</span>
                    </div>
                </div>
            </Fade>

            <Backdrop className={classes.backdrop} open={isLoggingIn}>
                <CircularProgress color="inherit" />
            </Backdrop>

        </div>
    )
}