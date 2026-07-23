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
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {
	clearToken,
	getApiBaseURLsMergedWithConfig,
	getToken,
	storeToken,
} from '@src/helpers/StorageHelper';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';
import {
	get360dialogLoginPageURL,
	getHubURL,
	prepareURLForDisplay,
} from '@src/helpers/URLHelper';
import { is360dialogLoginEnabled } from '@src/helpers/ConfigHelper';
// @ts-ignore
import dialog360Icon from '../../assets/images/ic-360dialog.png';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import InboxSelectorDialog from '@src/components/InboxSelectorDialog';
import { AxiosError } from 'axios';
import { fetchSessionToken, login, logout } from '@src/api/authApi';
import * as Styled from './Login.styles';
import { fetchBase } from '@src/api/healthApi';
import api from '@src/api/axiosInstance';
import { fetchCurrentUser, updateUserAvailability } from '@src/api/usersApi';
import { User } from '@src/types/users';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';

const Login: React.FC = () => {
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
	const [sessionUser, setSessionUser] = useState<User>();

	const navigate = useNavigate();
	const location = useLocation();

	const [searchParams] = useSearchParams();

	useEffect(() => {
		// Remove consumed params (if they exist) from the URL below
		const params = Object.fromEntries(searchParams.entries());
		let hasConsumedParams = false;

		if ('integration_api_base_url' in params) {
			delete params['integration_api_base_url'];
			hasConsumedParams = true;
		}

		// Error reported by the "Login with 360dialog" flow (d360_sso_button.js
		// in the backend sends the user back here with this param on failure)
		if ('360dialog_login_error' in params) {
			const ssoErrorMessages: { [key: string]: string } = {
				// The account was logged out at 360dialog after this error,
				// so trying again offers logging in with another account
				unauthorized:
					'Your 360dialog account does not have access to this inbox. Please try again with another account.',
				no_session:
					'Could not retrieve your 360dialog session. Please try again.',
			};
			setLoginError(
				ssoErrorMessages[params['360dialog_login_error']] ??
					'Logging in with 360dialog has failed. Please try again later.'
			);
			delete params['360dialog_login_error'];
			hasConsumedParams = true;
		}

		if (hasConsumedParams) {
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
		// Token stored in local storage has priority over the backend session
		const token = getToken();
		if (token) {
			setValidatingToken(true);

			try {
				await fetchBase();

				// Redirect to main route
				navigate('/main');
				return;
			} catch (error: any | AxiosError) {
				console.error(error);

				setValidatingToken(false);

				if (error.response?.status == 403) {
					clearToken();
				}
			}
		}

		// No (valid) token, check if there is a backend session (admin panel or SSO)
		// Skipped for invalidToken error case as the session is being cleared then
		if (!getToken() && errorCase !== 'invalidToken') {
			try {
				// withCredentials sends the session cookie also cross-origin (local dev)
				setSessionUser(await fetchCurrentUser({ withCredentials: true }));
			} catch (error) {
				// No backend session, user has to log in with the form
			}
		}
	};

	const continueWithSession = async () => {
		setLoggingIn(true);

		try {
			const data = await fetchSessionToken();
			await completeLogin(data.token);
		} catch (error: any | AxiosError) {
			console.error(error);

			setLoggingIn(false);
			setSessionUser(undefined);
			setLoginError('Your session has expired. Please log in again.');
		}
	};

	const completeLogin = async (token: string) => {
		// Store token in local storage
		storeToken(token);

		// Android web interface
		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.registerUserToken(token ?? '');
		}

		// Check if user availability is enabled
		if (config?.APP_IS_USER_AVAILABILITY_ENABLED === 'true') {
			try {
				// Get current user id
				const userData = await fetchCurrentUser();

				// Set as available on login
				if (userData.profile && !userData.profile.is_available) {
					await updateUserAvailability(userData.id, { is_available: true });
				}
			} catch (error: any | AxiosError) {
				// Accounts without a profile (e.g. superadmin) get a 404 here
				// but can still use the app; Main handles them the same way
				if (error?.response?.status !== 404) {
					throw error;
				}
			}
		}

		// Redirect to main route
		navigate(
			(location.state?.nextPath ?? '/main') + location.state?.search ?? ''
		);
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
			await completeLogin(data.token);
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

	const doLoginWith360dialog = () => {
		// Display the loading animation until the browser navigates away
		setLoggingIn(true);

		// The backend login page runs the SSO round trip with 360dialog and
		// comes back to this URL with a refresh_token query parameter, which
		// is converted into an auth token on load (useRefreshToken).
		// Forked deployments can override the URL via config, but it has to
		// be allowed by the backend (INBOX_SSO_ALLOWED_REDIRECT_URLS).
		const redirectUrl =
			config?.APP_360DIALOG_LOGIN_REDIRECT_URL ||
			window.location.origin + window.location.pathname;

		window.location.href = get360dialogLoginPageURL(
			api.defaults.baseURL ?? '/api/v1/',
			redirectUrl,
			// A backend session already offers "Continue as": using the button
			// anyway means logging in with a different 360dialog account
			!!sessionUser
		);
	};

	const logoutToClearSession = async () => {
		try {
			await logout();
		} catch (error) {
			// Ignored, there may be no backend session to clear
			console.error(error);
		}
	};

	return (
		<Styled.LoginWrapper>
			<Fade in={true}>
				<Styled.LoginColumn>
					<Styled.LogoWrapper>
						<Styled.Logo
							src={process.env.REACT_APP_LOGO_URL ?? '/logo.png'}
							alt="Logo"
						/>
					</Styled.LogoWrapper>

					<Styled.LoginBody>
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
						<p>
							{sessionUser
								? t('Pick up where you left off')
								: t('Please log in to start')}
						</p>

						{sessionUser && (
							<>
								<Styled.SessionCard
									data-testid="continue-with-session"
									focusRipple
									onClick={continueWithSession}
								>
									<CustomAvatar
										src={
											sessionUser.profile?.large_avatar ??
											sessionUser.profile?.avatar
										}
										generateBgColorBy={sessionUser.username}
									>
										{generateInitialsHelper(sessionUser.username)}
									</CustomAvatar>
									<Styled.SessionCardInfo>
										<Styled.SessionCardLabel>
											{t('Continue as')}
										</Styled.SessionCardLabel>
										<Styled.SessionCardName>
											{[sessionUser.first_name, sessionUser.last_name]
												.filter(Boolean)
												.join(' ') || sessionUser.username}
										</Styled.SessionCardName>
									</Styled.SessionCardInfo>
									<Styled.SessionCardArrow />
								</Styled.SessionCard>

								<Styled.OrDivider>
									{t('or log in with another account')}
								</Styled.OrDivider>
							</>
						)}

						{loginError && (
							<Styled.LoginAlert severity="error">
								{t(loginError)}
							</Styled.LoginAlert>
						)}

						{is360dialogLoginEnabled(config) && (
							<>
								<Styled.SSOLoginButton
									data-testid="login-with-360dialog"
									type="button"
									size="large"
									variant="contained"
									fullWidth
									disableElevation
									onClick={doLoginWith360dialog}
								>
									<img src={dialog360Icon} alt="" />
									{t('Login with 360dialog')}
								</Styled.SSOLoginButton>
								<Styled.OrDivider>{t('or')}</Styled.OrDivider>
							</>
						)}

						<form onSubmit={doLogin}>
							<TextField
								variant="standard"
								data-testid="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								label={t('Username')}
								autoComplete="username"
								size="medium"
								fullWidth={true}
							/>
							<TextField
								variant="standard"
								data-testid="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type="password"
								label={t('Password')}
								autoComplete="current-password"
								size="medium"
								fullWidth={true}
							/>
							<Button
								data-testid="submit"
								type="submit"
								size="large"
								variant="outlined"
								color="primary"
								fullWidth
								disableElevation
							>
								{t('Log in')}
							</Button>
						</form>

						<Styled.AdminPanelRow>
							<Styled.AdminPanelLink
								href={getHubURL(config?.API_BASE_URL ?? '')}
							>
								{t('Admin panel')}
								<OpenInNewRoundedIcon />
							</Styled.AdminPanelLink>
						</Styled.AdminPanelRow>

						{isValidatingToken && (
							<Styled.ValidatingToken>
								<h2>{t('Welcome')}</h2>
								<p>{t('We are validating your session, please wait.')}</p>
							</Styled.ValidatingToken>
						)}
					</Styled.LoginBody>

					<Styled.VersionWrapper>
						<Styled.Version>Version: {packageJson?.version}</Styled.Version>
					</Styled.VersionWrapper>
				</Styled.LoginColumn>
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
