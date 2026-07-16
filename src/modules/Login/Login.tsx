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
import { getHubURL, prepareURLForDisplay } from '@src/helpers/URLHelper';
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
			// Get current user id
			const userData = await fetchCurrentUser();

			// Set as available on login
			if (!userData.profile.is_available) {
				await updateUserAvailability(userData.id, { is_available: true });
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
								: t('Please login to start')}
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
								variant="contained"
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
