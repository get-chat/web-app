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
	getLastTenantId,
	getToken,
	storeCurrentTenantId,
	storeLastTenantId,
	storeTenantToken,
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
import { fetchCurrentUser } from '@src/api/usersApi';
import {
	acceptInviteKeepingToken,
	setAvailableOnEntry,
} from '@src/helpers/InboxHelper';
import InboxList, {
	getInboxTitle,
} from '@src/components/InboxSwitcher/InboxList';
import InviteHero from '@src/components/InboxSwitcher/InviteHero';
import { getInviteError } from '@src/components/InboxSwitcher/AcceptInviteDialog';
import { Tenant } from '@src/types/tenants';
import { toast } from 'sonner';
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
	// An invite into an inbox: logging in (or creating an account) accepts it
	const inviteCode = useAppSelector((state) => state.UI.inviteCode);

	const [username, setUsername] = useState(activatedUsername ?? '');
	const [password, setPassword] = useState('');
	const [isLoggingIn, setLoggingIn] = useState(false);
	const [isValidatingToken, setValidatingToken] = useState(false);
	const [loginError, setLoginError] = useState('');
	// An account in several inboxes picks one after the password was checked
	const [tenantChoice, setTenantChoice] = useState<Tenant[]>();
	const [openingTenantId, setOpeningTenantId] = useState<string>();
	// Invite only: a new account accepts it
	const [isCreatingAccount, setCreatingAccount] = useState(false);
	const [passwordRepeat, setPasswordRepeat] = useState('');

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

	// `tenant`: the inbox the token belongs to, when the login named one
	// `account`: the username the backend named, when it differs from what was
	// typed (an accepted invite answers with it)
	const completeLogin = async (
		token: string,
		tenant?: Tenant,
		account = username
	) => {
		// Store token in local storage
		storeToken(token);

		if (tenant) {
			storeCurrentTenantId(tenant.id);
			storeTenantToken(account, tenant.id, token);
			storeLastTenantId(account, tenant.id);
		}

		// Android web interface
		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.registerUserToken(token ?? '');
		}

		// Set as available on login, if the user availability feature set is
		// enabled (backend setting, requires the token stored above)
		await setAvailableOnEntry();

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

		if (inviteCode && isCreatingAccount && password !== passwordRepeat) {
			setLoginError('The passwords do not match.');
			return false;
		}

		// Display the loading animation
		setLoggingIn(true);

		if (inviteCode) {
			await loginAcceptingInvite();
			return;
		}

		try {
			const data = await login({ username, password });
			await completeLogin(data.token);
		} catch (error: any | AxiosError) {
			// The account is in several inboxes: the inbox it used last on this
			// device, else the user picks one
			const tenants: Tenant[] | undefined =
				error.response?.status === 400
					? error.response.data?.tenants
					: undefined;
			if (tenants?.length) {
				const lastTenant = tenants.find(
					(tenant) => tenant.id === getLastTenantId(username)
				);
				if (lastTenant && (await loginToTenant(lastTenant))) {
					return;
				}
				setLoggingIn(false);
				setTenantChoice(tenants);
				return;
			}

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

	// Logs into one of the account's inboxes; whether it worked (else the
	// error is shown)
	// `token`: one at hand already (an accepted invite's), else the password
	// gets one
	const loginToTenant = async (
		tenant: Tenant,
		token?: string,
		account?: string
	) => {
		try {
			await completeLogin(
				token ?? (await login({ username, password, tenant: tenant.id })).token,
				tenant,
				account
			);
			return true;
		} catch (error: any | AxiosError) {
			console.error(error);
			setLoginError(
				error.response?.data?.reason ??
					'An error has occurred. Please try again later.'
			);
			return false;
		}
	};

	const chooseTenant = async (tenant: Tenant) => {
		setLoginError('');
		setOpeningTenantId(tenant.id);
		if (!(await loginToTenant(tenant))) {
			setOpeningTenantId(undefined);
		}
	};

	const isLoginForm = !activationCode && !tenantChoice;

	const dismissInvite = () => {
		dispatch(setState({ inviteCode: undefined }));
		setCreatingAccount(false);
		setLoginError('');
	};

	const leaveTenantChoice = () => {
		setTenantChoice(undefined);
		setPassword('');
		setLoginError('');
	};

	// Accepts the invite with the account in the form (or a new one), then
	// logs into the inbox it opened
	const loginAcceptingInvite = async () => {
		setLoginError('');
		let tenant: Tenant;
		let token: string | undefined;
		let account: string;
		try {
			const accepted = await acceptInviteKeepingToken({
				code: inviteCode!,
				username,
				password,
				new_account: isCreatingAccount || undefined,
			});
			tenant = accepted.tenant;
			token = accepted.token;
			account = accepted.username;
		} catch (error: any | AxiosError) {
			setLoggingIn(false);
			const data = error.response?.data ?? {};
			if (data.code) {
				// Invalid, expired or used: what is left is a regular login
				dispatch(setState({ inviteCode: undefined }));
				setCreatingAccount(false);
			}
			setLoginError(getInviteError(data));
			return;
		}

		dispatch(setState({ inviteCode: undefined }));
		// The invite's token opens the inbox; older backends send none, then
		// the password does
		if (await loginToTenant(tenant, token, account)) {
			toast.success(
				t('You now have access to %s', {
					postProcess: 'sprintf',
					sprintf: [getInboxTitle(tenant)],
				})
			);
		} else {
			setLoggingIn(false);
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

					{isLoginForm && inviteCode && <InviteHero className="mt-1 mb-4" />}

					<h2 className={loginTitleClassName}>
						{activationCode
							? t('Set your password')
							: tenantChoice
							? t('Choose an inbox')
							: inviteCode
							? isCreatingAccount
								? t('Create your account')
								: t("You're invited to an inbox")
							: t('Welcome')}
					</h2>
					<p className={cn(loginSubtitleClassName, 'text-balance')}>
						{activationCode
							? t('Choose a password to finish activating your account.')
							: tenantChoice
							? t(
									'Your account has access to more than one inbox. You can switch between them at any time.'
							  )
							: inviteCode
							? isCreatingAccount
								? t('Choose a username and a password to accept your invite.')
								: t('Log in to accept it, or create an account if you are new.')
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

					{isLoginForm && !isCreatingAccount && sessionUser && (
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

					{/* Not with an invite: the round trip would lose it */}
					{isLoginForm && !inviteCode && is360dialogLoginEnabled(config) && (
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

					{!activationCode && tenantChoice && (
						<>
							<div className="overflow-hidden rounded-[12px] border border-gray-light">
								<InboxList
									tenants={tenantChoice}
									pendingTenantId={openingTenantId}
									onSelect={chooseTenant}
									listClassName="max-h-[min(340px,50vh)]"
								/>
							</div>
							<div className="mt-4 flex justify-center">
								<Button
									variant="link"
									color="secondary"
									size="none"
									className="text-[13px]"
									disabled={!!openingTenantId}
									onClick={leaveTenantChoice}
								>
									{t('Log in with another account')}
								</Button>
							</div>
						</>
					)}

					{isLoginForm && (
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
									autoComplete={
										isCreatingAccount ? 'new-password' : 'current-password'
									}
								/>
							</Field>
							{isCreatingAccount && (
								<Field className={loginFieldClassName}>
									<FieldLabel htmlFor="login-password-repeat">
										{t('Repeat the password')}
									</FieldLabel>
									<Input
										id="login-password-repeat"
										value={passwordRepeat}
										onChange={(e) => setPasswordRepeat(e.target.value)}
										type="password"
										autoComplete="new-password"
									/>
								</Field>
							)}
							<Button
								data-testid="submit"
								type="submit"
								size="lg"
								variant={inviteCode ? 'solid' : 'outline'}
								color="primary"
								className={loginSubmitClassName}
							>
								{!inviteCode
									? t('Log in')
									: isCreatingAccount
									? t('Create account and join')
									: t('Log in and join')}
							</Button>
						</form>
					)}

					{isLoginForm && inviteCode && (
						<div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
							<span>
								{isCreatingAccount
									? t('Already have an account?')
									: t('New here?')}{' '}
								<Button
									variant="link"
									color="secondary"
									size="none"
									className="text-[13px]"
									onClick={() => {
										setCreatingAccount(!isCreatingAccount);
										setLoginError('');
									}}
								>
									{isCreatingAccount ? t('Log in') : t('Create an account')}
								</Button>
							</span>
							<span aria-hidden>·</span>
							<Button
								variant="link"
								color="neutral"
								size="none"
								className="text-[13px] text-muted-foreground"
								onClick={dismissInvite}
							>
								{t('Ignore the invite')}
							</Button>
						</div>
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
							<p className={cn(loginSubtitleClassName, 'text-balance')}>
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
