import React, { useContext, useEffect, useState } from 'react';
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
} from '@src/helpers/StorageHelper';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';
import { getHubURL, prepareURLForDisplay } from '@src/helpers/URLHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import InboxSelectorDialog from '@src/components/InboxSelectorDialog';
import { AxiosError } from 'axios';
import { login, logout } from '@src/api/authApi';
import * as Styled from './Login.styles';
import { fetchBase } from '@src/api/healthApi';
import api from '@src/api/axiosInstance';

const Login = () => {
	const config = useContext(AppConfigContext);

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
				pathname: location?.pathname,
				search: `?${createSearchParams(params)}`,
			};

			// Update query params
			navigate(options, { replace: true });
		}

		if (errorCase) {
			setLoginError(
				// @ts-ignore
				errorMessages[errorCase]
			);

			if (errorCase === 'invalidToken') {
				logoutToClearSession();
			}
		}

		doFetchBase();
	}, []);

	const doFetchBase = async () => {
		const token = getToken();
		if (token) {
			setValidatingToken(true);

			try {
				await fetchBase();

				// Redirect to main route
				navigate('/main');
			} catch (error: any | AxiosError) {
				console.error(error);

				setValidatingToken(false);

				if (error.response?.status == 403) {
					clearToken();
				}
			}
		}
	};

	const doLogin = async (event: React.FormEvent) => {
		event.preventDefault();

		// Check if username or password is empty
		if (username.trim() === '' || password.trim() === '') {
			console.log('Empty credentials');
			setLoginError('Please enter a valid username and password!');
			return false;
		}

		// Display the loading animation
		setLoggingIn(true);

		try {
			const data = await login({ username, password });
			// Store token in local storage
			storeToken(data.token);

			// Android web interface
			if (window.AndroidWebInterface) {
				window.AndroidWebInterface.registerUserToken(data.token ?? '');
			}

			// Redirect to main route
			navigate(
				(location.state?.nextPath ?? '/main') + location.state?.search ?? ''
			);
		} catch (error: any | AxiosError) {
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
	};

	const logoutToClearSession = async () => {
		await logout();
	};

	return (
		<Styled.LoginWrapper>
			<Fade in={true}>
				<Styled.LoginBody>
					<Styled.LogoWrapper>
						<Styled.Logo
							src={process.env.REACT_APP_LOGO_URL ?? '/logo.png'}
							alt="Logo"
						/>
					</Styled.LogoWrapper>

					{storedURLs.length > 1 && (
						<Styled.InboxUrl>
							<h3>{t('Your current inbox')}</h3>
							<div>
								{prepareURLForDisplay(api.defaults.baseURL ?? '')}
								<a
									href="#"
									className="ml-1"
									onClick={() => setInboxSelectorVisible(true)}
								>
									{t('Change')}
								</a>
							</div>
						</Styled.InboxUrl>
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
							autoComplete="username"
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
							autoComplete="current-password"
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

						<Styled.AdminPanelButton
							// @ts-ignore
							color="black"
							href={getHubURL(config?.API_BASE_URL ?? '')}
							target="_blank"
							fullWidth
							variant="text"
						>
							{t('Admin panel')}
						</Styled.AdminPanelButton>
					</form>

					{isValidatingToken && (
						<Styled.ValidatingToken>
							<h2>{t('Welcome')}</h2>
							<p>{t('We are validating your session, please wait.')}</p>
						</Styled.ValidatingToken>
					)}

					{loginError && <Alert severity="error">{t(loginError)}</Alert>}

					<Styled.VersionWrapper>
						<Styled.Version>Version: {packageJson?.version}</Styled.Version>
					</Styled.VersionWrapper>
				</Styled.LoginBody>
			</Fade>

			<InboxSelectorDialog
				isVisible={isInboxSelectorVisible}
				setVisible={setInboxSelectorVisible}
			/>

			<Backdrop className="login__backdrop" open={isLoggingIn}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Styled.LoginWrapper>
	);
};

export default Login;
