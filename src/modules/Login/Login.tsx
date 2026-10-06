import React, { useContext, useEffect, useState } from 'react';
import {
	createSearchParams,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import OpenInNewRoundedIcon from '@src/components/icons/OpenInNew';
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
import ArrowForwardRoundedIcon from '@src/components/icons/ArrowForward';
import { Alert } from '@src/components/ui/alert';
import { cn } from '@src/lib/utils';
import {
	loginAlertClassName,
	loginFieldClassName,
	loginSubmitClassName,
	loginSubtitleClassName,
	loginTitleClassName,
	orDividerClassName,
} from './loginClassNames';
import { fetchBase } from '@src/api/healthApi';
import api from '@src/api/axiosInstance';
import { fetchCurrentUser, updateUserAvailability } from '@src/api/usersApi';
import { fetchUserAvailabilitySettings } from '@src/api/settingsApi';
import { User } from '@src/types/users';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import SetPasswordForm from './SetPasswordForm';
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import { Spinner } from '@src/components/ui/spinner';

const Login: React.FC = () => {
	const config = useContext(AppConfigContext);

	const { t } = useTranslation();

	const { errorCase } = useParams();

	const errorMessages = {
		incorrectRole: 'Only admins and users can access to our web app.',
		notLoggedIn: 'You are not logged in.',
		invalidToken: 'Invalid token.',
	};

	// Set by AppBody from the query parameters the backend appends after an
	// activation link is opened
	const isAccountActivated = useAppSelector(
		(state) => state.UI.isAccountActivated
	);
	const activatedUsername = useAppSelector(
		(state) => state.UI.activatedUsername
	);
	const activationCode = useAppSelector((state) => state.UI.activationCode);

	const [username, setUsername] = useState(activatedUsername ?? '');
	const [password, setPassword] = useState('');
	const [isLoggingIn, setLoggingIn] = useState(false);
	const [isValidatingToken, setValidatingToken] = useState(false);
	const [loginError, setLoginError] = useState('');

	const [isInboxSelectorVisible, setInboxSelectorVisible] = useState(false);
	const [storedURLs] = useState(getApiBaseURLsMergedWithConfig(config));
	const [sessionUser, setSessionUser] = useState<User>();

	useEffect(() => {
		if (activatedUsername) {
			setUsername(activatedUsername);
		}
	}, [activatedUsername]);

	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useAppDispatch();

	const onPasswordSet = (setUsername: string) => {
		// Hand over to the login form, with the activation notice and the
		// username prefilled
		dispatch(
			setState({
				activationCode: undefined,
				isAccountActivated: true,
				activatedUsername: setUsername,
			})
		);
	};

	const onInvalidActivationCode = () => {
		dispatch(setState({ activationCode: undefined }));
		setLoginError('This activation link is invalid or was already used.');
	};

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

		// Start the "Login with 360dialog" flow automatically when requested via
		// ?sso=360dialog, so it can be linked to directly without clicking the
		// button. Skipped when already logged in (doFetchBase handles that). The
		// SSO redirect target uses only the path, so the param is dropped on the
		// way back and the flow does not restart.
		if (
			params['sso'] === '360dialog' &&
			is360dialogLoginEnabled(config) &&
			!getToken()
		) {
			doLoginWith360dialog();
			return;
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
		// and while an activation link's user is choosing their password
		if (!getToken() && errorCase !== 'invalidToken' && !activationCode) {
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

		// Check if the user availability feature set is enabled (backend
		// setting, requires the token stored above)
		try {
			const { feature_set_enabled } = await fetchUserAvailabilitySettings();

			if (feature_set_enabled) {
				// Get current user id
				const userData = await fetchCurrentUser();

				// Set as available on login
				if (userData.profile && !userData.profile.is_available) {
					await updateUserAvailability(userData.id, { is_available: true });
				}
			}
		} catch (error: any | AxiosError) {
			// Accounts without a profile (e.g. superadmin) get a 404 here
			// but can still use the app; Main handles them the same way
			if (error?.response?.status !== 404) {
				throw error;
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
		<div
			id="login"
			className="absolute top-0 left-0 flex size-full overflow-y-auto bg-[radial-gradient(480px_320px_at_50%_16%,rgba(101,203,172,0.16),transparent_70%),linear-gradient(180deg,var(--gray-lighter),#e9ecf2)] p-6 max-md:bg-white max-md:bg-none max-md:p-0"
		>
			<div className="m-auto flex w-full max-w-[450px] animate-fade-in flex-col items-center">
				<div className="mb-5 flex justify-center max-md:mt-10">
					<img
						className="size-16"
						src={process.env.REACT_APP_LOGO_URL ?? '/logo.png'}
						alt="Logo"
					/>
				</div>

				<div className="relative w-full rounded-[15px] border border-white/80 bg-white px-8 pt-7.5 pb-6.5 shadow-[0_24px_48px_-24px_rgba(0,0,45,0.35),0_1px_2px_rgba(0,0,45,0.06)] max-md:rounded-none max-md:border-none max-md:shadow-none">
					{storedURLs.length > 1 && (
						<div className="mt-0 mb-3.75 text-center text-[12px]">
							<h3>{t('Your current inbox')}</h3>
							<div>
								{prepareURLForDisplay(api.defaults.baseURL ?? '')}
								<a
									href="#"
									className="ml-1.25 text-(--color-secondary)"
									onClick={() => setInboxSelectorVisible(true)}
								>
									{t('Change')}
								</a>
							</div>
						</div>
					)}

					<h2 className={loginTitleClassName}>
						{activationCode ? t('Set your password') : t('Welcome')}
					</h2>
					<p className={loginSubtitleClassName}>
						{activationCode
							? t('Choose a password to finish activating your account.')
							: sessionUser
							? t('Pick up where you left off')
							: t('Please log in to start')}
					</p>

					{activationCode && (
						<SetPasswordForm
							code={activationCode}
							username={activatedUsername}
							onPasswordSet={onPasswordSet}
							onInvalidCode={onInvalidActivationCode}
						/>
					)}

					{!activationCode && sessionUser && (
						<>
							<button
								type="button"
								className="group/session m-0 flex w-full cursor-pointer items-center gap-3 rounded-[10px] border border-[rgba(101,203,172,0.5)] bg-white px-4 py-3 text-left [font:inherit] text-inherit shadow-[0_2px_10px_-4px_rgba(101,203,172,0.4)] transition-[border-color,background-color,box-shadow] duration-250 ease-[ease] [-webkit-tap-highlight-color:transparent] hover:border-primary hover:bg-(--color-primary-transparent) hover:shadow-[0_4px_16px_-6px_rgba(101,203,172,0.7)] focus-visible:outline-primary! motion-reduce:transition-none"
								data-testid="continue-with-session"
								onClick={continueWithSession}
							>
								<CustomAvatar
									className="size-11 text-[18px]/none"
									src={
										sessionUser.profile?.large_avatar ??
										sessionUser.profile?.avatar
									}
									generateBgColorBy={sessionUser.username}
								>
									{generateInitialsHelper(sessionUser.username)}
								</CustomAvatar>
								<div className="flex min-w-0 flex-1 flex-col gap-0.5">
									<div className="text-[12px] text-muted-foreground">
										{t('Continue as')}
									</div>
									<div className="truncate text-[15px] font-semibold text-[var(--text-color,#212329)]">
										{[sessionUser.first_name, sessionUser.last_name]
											.filter(Boolean)
											.join(' ') || sessionUser.username}
									</div>
								</div>
								{/* Nudges right on hover; ! beats the icons' own fill transition */}
								<ArrowForwardRoundedIcon className="shrink-0 text-primary! transition-transform! duration-350! ease-[cubic-bezier(0.34,1.56,0.64,1)]! group-hover/session:translate-x-1 motion-reduce:transition-none! motion-reduce:group-hover/session:translate-x-0" />
							</button>

							<div className={orDividerClassName}>
								{t('or log in with another account')}
							</div>
						</>
					)}

					{!activationCode && isAccountActivated && !loginError && (
						<Alert className={loginAlertClassName} severity="success">
							{t('Your account has been activated. Please log in to continue.')}
						</Alert>
					)}

					{!activationCode && loginError && (
						<Alert className={loginAlertClassName} severity="error">
							{t(loginError)}
						</Alert>
					)}

					{!activationCode && is360dialogLoginEnabled(config) && (
						<>
							<Button
								data-testid="login-with-360dialog"
								type="button"
								size="lg"
								variant="solid"
								color="primary"
								className={cn(loginSubmitClassName, 'mt-0 py-[9px]')}
								onClick={doLoginWith360dialog}
							>
								<img className="mr-2 size-[18px]" src={dialog360Icon} alt="" />
								{t('Login with 360dialog')}
							</Button>
							<div className={orDividerClassName}>{t('or')}</div>
						</>
					)}

					{!activationCode && (
						<form onSubmit={doLogin}>
							<Field data-testid="username" className={loginFieldClassName}>
								<FieldLabel htmlFor="login-username">
									{t('Username')}
								</FieldLabel>
								<Input
									id="login-username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									autoComplete="username"
								/>
							</Field>
							<Field data-testid="password" className={loginFieldClassName}>
								<FieldLabel htmlFor="login-password">
									{t('Password')}
								</FieldLabel>
								<Input
									id="login-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									type="password"
									autoComplete="current-password"
								/>
							</Field>
							<Button
								data-testid="submit"
								type="submit"
								size="lg"
								variant="outline"
								color="primary"
								className={loginSubmitClassName}
							>
								{t('Log in')}
							</Button>
						</form>
					)}

					{!activationCode && (
						<div className="mt-[18px] flex justify-center">
							<a
								className="inline-flex items-center gap-1 text-[13px] text-muted-foreground no-underline transition-colors duration-200 ease-[ease] hover:text-foreground focus-visible:rounded-[4px] focus-visible:outline-primary! motion-reduce:transition-none [&_svg]:text-[15px]!"
								href={getHubURL(config?.API_BASE_URL ?? '')}
							>
								{t('Admin panel')}
								<OpenInNewRoundedIcon />
							</a>
						</div>
					)}

					{isValidatingToken && (
						<div className="absolute inset-0 flex flex-col items-center justify-center rounded-[15px] bg-white">
							<h2 className={loginTitleClassName}>{t('Welcome')}</h2>
							<p className={loginSubtitleClassName}>
								{t('We are validating your session, please wait.')}
							</p>
						</div>
					)}
				</div>

				<div className="mt-5 flex justify-center max-md:mb-5">
					<div className="text-[11px] tracking-[0.02em] text-muted-foreground opacity-80">
						Version: {packageJson?.version}
					</div>
				</div>
			</div>

			<InboxSelectorDialog
				isVisible={isInboxSelectorVisible}
				setVisible={setInboxSelectorVisible}
			/>

			{isLoggingIn && (
				<div className="login__backdrop fixed inset-0 z-[1300] flex animate-fade-in items-center justify-center bg-black/50 text-white">
					<Spinner size={40} />
				</div>
			)}
		</div>
	);
};

export default Login;
