// @ts-nocheck
import React, { useEffect, useState } from 'react';
import '../styles/Login.css';
import { Backdrop, CircularProgress, Fade, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import {
	createSearchParams,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import Alert from '@mui/material/Alert';
import {
	clearToken,
	getApiBaseURLsMergedWithConfig,
	getToken,
	storeToken,
} from '../helpers/StorageHelper';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../contexts/ApplicationContext';
import packageJson from '../../package.json';
import { getHubURL, prepareURLForDisplay } from '@src/helpers/URLHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import InboxSelectorDialog from '@src/components/InboxSelectorDialog';

const Login = () => {
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfigContext);

	const { t } = useTranslation();

	const { errorCase } = useParams();

	const errorMessages = {
		incorrectRole: 'Only admins and users can access to our web app.',
		notLoggedIn: 'You are not logged in.',
		invalidToken: 'Invalid token.',
	};

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoggingIn, setLoggingIn] = useState(false);
	const [isValidatingToken, setValidatingToken] = useState(false);
	const [loginError, setLoginError] = useState('');

	const [isInboxSelectorVisible, setInboxSelectorVisible] = useState(false);
	const [storedURLs] = useState(getApiBaseURLsMergedWithConfig(config));

	const navigate = useNavigate();
	const location = useLocation();

	const [searchParams] = useSearchParams();

	useEffect(() => {
		// Remove integration_api_base_url param if exists
		const params = Object.fromEntries(searchParams.entries());
		if ('integration_api_base_url' in params) {
			delete params['integration_api_base_url'];

			const options = {
				pathname: location.pathname,
				search: `?${createSearchParams(params)}`,
			};

			// Update query params
			navigate(options, { replace: true });
		}

		if (errorCase) {
			setLoginError(errorMessages[errorCase]);

			if (errorCase === 'invalidToken') {
				logoutToClearSession();
			}
		}

		const token = getToken();
		if (token) {
			setValidatingToken(true);

			apiService.baseCall(
				() => {
					// Redirect to main route
					navigate('/main');
				},
				() => {
					setValidatingToken(false);

					// TODO: Make sure the response is Unauthorized
					clearToken();
				}
			);
		}
	}, []);

	const doLogin = async (e) => {
		e.preventDefault();

		// Check if username or password is empty
		if (username.trim() === '' || password.trim() === '') {
			console.log('Empty credentials');
			setLoginError('Please enter a valid username and password!');
			return false;
		}

		// Display the loading animation
		setLoggingIn(true);

		apiService.loginCall(
			username,
			password,
			(response) => {
				// Store token in local storage
				storeToken(response.data.token);

				// Android web interface
				if (window.AndroidWebInterface) {
					window.AndroidWebInterface.registerUserToken(
						response.data.token ?? ''
					);
				}

				// Redirect to main route
				navigate(
					(location.state?.nextPath ?? '/main') + location.state?.search ?? ''
				);
			},
			(error) => {
				// Hide the loading animation
				setLoggingIn(false);
				setLoginError('');

				if (error.response) {
					// Current status code for incorrect credentials must be changed to 401 or 403
					if ([400, 401, 403].includes(error.response.status)) {
						setLoginError('Incorrect username or password.');
					} else {
						setLoginError('An error has occurred. Please try again later.');
					}
				}
			}
		);
	};

	const logoutToClearSession = () => {
		apiService.logoutCall();
	};

	return (
		<div className="login">
			<Fade in={true}>
				<div className="login__body">
					<div className="login__body__logoWrapper">
						<img
							className="login__body__logo"
							src={process.env.REACT_APP_LOGO_URL ?? '/logo.png'}
							alt="Logo"
						/>
					</div>

					{storedURLs.length > 1 && (
						<div className="login__body__inboxUrl mt-3 mb-3">
							<h3>{t('Your current inbox')}</h3>
							<div>
								{prepareURLForDisplay(apiService.apiBaseURL)}
								<a
									href="#"
									className="ml-1"
									onClick={() => setInboxSelectorVisible(true)}
								>
									{t('Change')}
								</a>
							</div>
						</div>
					)}

					<h2>{t('Welcome')}</h2>
					<p>{t('Please login to start')}</p>

					<form onSubmit={doLogin}>
						<TextField
							variant="standard"
							data-test-id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							label={t('Username')}
							size="medium"
							fullWidth={true}
						/>
						<TextField
							variant="standard"
							data-test-id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							type="password"
							label={t('Password')}
							size="medium"
							fullWidth={true}
						/>
						<Button
							data-test-id="submit"
							type="submit"
							size="large"
							variant="contained"
							color="primary"
							fullWidth
							disableElevation
						>
							{t('Log in')}
						</Button>

						<Button
							className="login__body__adminPanel"
							color="black"
							href={getHubURL(config.API_BASE_URL)}
							target="_blank"
							fullWidth
							variant="text"
						>
							{t('Admin panel')}
						</Button>
					</form>

					{isValidatingToken && (
						<div className="login__validatingToken">
							<h2>{t('Welcome')}</h2>
							<p>{t('We are validating your session, please wait.')}</p>
						</div>
					)}

					{loginError && <Alert severity="error">{t(loginError)}</Alert>}

					<div className="login__body__versionWrapper">
						<span className="login__body__version">
							Version: {packageJson.version}
						</span>
					</div>
				</div>
			</Fade>

			<InboxSelectorDialog
				isVisible={isInboxSelectorVisible}
				setVisible={setInboxSelectorVisible}
			/>

			<Backdrop className="login__backdrop" open={isLoggingIn}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</div>
	);
};

export default Login;
