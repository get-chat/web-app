import React, { useEffect, useRef, useState } from 'react';
import * as Styled from './CreateUserDialog.styles';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormHelperText,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	Tooltip,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Trans, useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { changeUserPassword, createUser } from '@src/api/usersApi';
import {
	CreateUserRequest,
	CreateUserResponse,
	UserRole,
} from '@src/types/users';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

// Usernames are validated by the API too, only alphanumeric characters are allowed
const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;
const MIN_PASSWORD_LENGTH = 8;

const FORM_FIELDS = [
	'username',
	'first_name',
	'last_name',
	'email',
	'password',
] as const;

type FieldName = typeof FORM_FIELDS[number];
type FieldErrors = Partial<Record<FieldName, string>>;

const ROLE_DESCRIPTIONS: { [key in UserRole]: string } = {
	user: 'Can use the inbox, except for actions marked as admin only.',
	admin: 'Full access to the inbox, including the admin panel.',
	app: 'API access for chatbots and integrations, without inbox access.',
};

const flattenError = (value: any): string => {
	if (Array.isArray(value)) {
		return value.map(flattenError).join(' ');
	}

	if (value && typeof value === 'object') {
		return Object.values(value).map(flattenError).join(' ');
	}

	return String(value);
};

// The API reports validation issues per field, the rest is shown as a single message
const parseApiError = (
	error: any | AxiosError
): { fieldErrors: FieldErrors; message?: string } => {
	const data = error?.response?.data;

	if (!data || typeof data !== 'object') {
		return { fieldErrors: {}, message: 'An error has occurred.' };
	}

	const fieldErrors: FieldErrors = {};
	const messages: string[] = [];

	Object.entries(data).forEach(([key, value]) => {
		if (FORM_FIELDS.includes(key as FieldName)) {
			fieldErrors[key as FieldName] = flattenError(value);
		} else {
			messages.push(flattenError(value));
		}
	});

	return {
		fieldErrors,
		message:
			messages.length > 0
				? messages.join(' ')
				: Object.keys(fieldErrors).length > 0
				? undefined
				: 'An error has occurred.',
	};
};

const CreateUserDialog: React.FC<Props> = ({ open, setOpen }) => {
	const { t } = useTranslation();

	const [username, setUsername] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<UserRole>('user');
	const [password, setPassword] = useState('');
	const [passwordRepeat, setPasswordRepeat] = useState('');

	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [error, setError] = useState<string>();
	const [warning, setWarning] = useState<string>();
	const [isRequesting, setRequesting] = useState(false);
	const [createdUser, setCreatedUser] = useState<CreateUserResponse>();

	const timeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [timeoutRef]);

	// App users authenticate with a token acquired via the activation link
	const isAppRole = role === 'app';

	const close = () => {
		setOpen(false);

		timeoutRef.current = setTimeout(function () {
			setUsername('');
			setFirstName('');
			setLastName('');
			setEmail('');
			setRole('user');
			setPassword('');
			setPasswordRepeat('');
			setFieldErrors({});
			setError(undefined);
			setWarning(undefined);
			setRequesting(false);
			setCreatedUser(undefined);
		}, 300);
	};

	// The activation link is returned once and cannot be requested again, so the
	// dialog must not be dismissed by a backdrop click or Esc while the user is
	// being created or while the link is on screen
	const handleClose = () => {
		if (isRequesting || createdUser) return;
		close();
	};

	const validate = (): FieldErrors => {
		const errors: FieldErrors = {};

		if (username.trim().length === 0) {
			errors.username = 'Username is required.';
		} else if (!USERNAME_PATTERN.test(username.trim())) {
			errors.username = 'Only letters and numbers are allowed.';
		}

		// Setting a password is optional, but once either field is filled both
		// have to be, otherwise the password would be silently dropped below
		if (!isAppRole && (password.length > 0 || passwordRepeat.length > 0)) {
			if (password.length < MIN_PASSWORD_LENGTH) {
				errors.password = 'Password must be at least 8 characters long.';
			} else if (password !== passwordRepeat) {
				errors.password = 'Passwords must match.';
			}
		}

		return errors;
	};

	const handleCreate = async () => {
		const errors = validate();
		setFieldErrors(errors);
		setError(undefined);
		setWarning(undefined);

		if (Object.keys(errors).length > 0) {
			return;
		}

		const data: CreateUserRequest = {
			username: username.trim(),
			profile: { role },
		};

		if (firstName.trim().length > 0) {
			data.first_name = firstName.trim();
		}

		if (lastName.trim().length > 0) {
			data.last_name = lastName.trim();
		}

		if (email.trim().length > 0) {
			data.email = email.trim();
		}

		setRequesting(true);

		let user: CreateUserResponse;

		try {
			user = await createUser(data);
		} catch (error: any | AxiosError) {
			const parsedError = parseApiError(error);
			setFieldErrors(parsedError.fieldErrors);
			setError(parsedError.message);
			setRequesting(false);
			return;
		}

		// The password is set with a separate request, the create endpoint doesn't accept one
		if (!isAppRole && password.length > 0) {
			try {
				await changeUserPassword(user.id, { password });
			} catch (error: any | AxiosError) {
				const parsedError = parseApiError(error);
				setWarning(
					parsedError.fieldErrors.password ??
						parsedError.message ??
						'The user was created, but the password could not be set.'
				);
			}
		}

		setRequesting(false);
		setCreatedUser(user);
	};

	const copyActivationLink = async () => {
		if (!createdUser || !navigator.clipboard) return;

		await navigator.clipboard.writeText(createdUser.activation_url);
		window.displaySuccess('Copied!');
	};

	return (
		<Styled.StyledDialog open={open} onClose={handleClose} fullWidth>
			<DialogTitle>
				{createdUser ? t('User created') : t('Create new user')}
			</DialogTitle>

			{createdUser ? (
				<DialogContent>
					<Alert severity="success">
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [createdUser.username],
							}}
						>
							The user <span className="bold">%s</span> has been created.
						</Trans>
					</Alert>

					<Styled.SectionLabel>{t('Activation link')}</Styled.SectionLabel>
					<Styled.ActivationLinkContainer>
						<Styled.ActivationLink>
							{createdUser.activation_url}
						</Styled.ActivationLink>
						<Tooltip title={t('Copy')}>
							<IconButton onClick={copyActivationLink} size="small">
								<ContentCopyIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Styled.ActivationLinkContainer>

					<Alert severity="warning">
						{isAppRole
							? t(
									'This link is shown only once. Opening it activates the user and returns the API token, which cannot be retrieved with this link again.'
							  )
							: t(
									'This link is shown only once. The account is ready to be used after the link is opened.'
							  )}
					</Alert>

					{warning && <Alert severity="warning">{t(warning)}</Alert>}
				</DialogContent>
			) : (
				<DialogContent>
					<Styled.FieldsContainer>
						<TextField
							variant="standard"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							label={t('Username')}
							error={Boolean(fieldErrors.username)}
							helperText={
								fieldErrors.username
									? t(fieldErrors.username)
									: t('Only letters and numbers are allowed.')
							}
							autoComplete="off"
							autoFocus
							required
							fullWidth
						/>

						<Styled.FieldsRow>
							<TextField
								variant="standard"
								value={firstName}
								onChange={(event) => setFirstName(event.target.value)}
								label={t('First name')}
								error={Boolean(fieldErrors.first_name)}
								helperText={fieldErrors.first_name && t(fieldErrors.first_name)}
								autoComplete="off"
								fullWidth
							/>

							<TextField
								variant="standard"
								value={lastName}
								onChange={(event) => setLastName(event.target.value)}
								label={t('Last name')}
								error={Boolean(fieldErrors.last_name)}
								helperText={fieldErrors.last_name && t(fieldErrors.last_name)}
								autoComplete="off"
								fullWidth
							/>
						</Styled.FieldsRow>

						<TextField
							variant="standard"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							label={t('E-mail')}
							type="email"
							error={Boolean(fieldErrors.email)}
							helperText={fieldErrors.email && t(fieldErrors.email)}
							autoComplete="off"
							fullWidth
						/>

						<FormControl variant="standard" fullWidth>
							<InputLabel id="create-user-role-select-label">
								{t('Role')}
							</InputLabel>
							<Select
								variant="standard"
								labelId="create-user-role-select-label"
								id="create-user-role-select"
								value={role}
								onChange={(event: SelectChangeEvent) =>
									setRole(event.target.value as UserRole)
								}
							>
								<MenuItem value="user">{t('User')}</MenuItem>
								<MenuItem value="admin">{t('Admin')}</MenuItem>
								<MenuItem value="app">{t('App integration')}</MenuItem>
							</Select>
							<FormHelperText>{t(ROLE_DESCRIPTIONS[role])}</FormHelperText>
						</FormControl>

						{!isAppRole && (
							<>
								<Styled.FieldsRow>
									<TextField
										variant="standard"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										label={t('Password')}
										type="password"
										error={Boolean(fieldErrors.password)}
										autoComplete="new-password"
										fullWidth
									/>

									<TextField
										variant="standard"
										value={passwordRepeat}
										onChange={(event) => setPasswordRepeat(event.target.value)}
										label={t('Password (repeat)')}
										type="password"
										error={Boolean(fieldErrors.password)}
										autoComplete="new-password"
										fullWidth
									/>
								</Styled.FieldsRow>

								<FormHelperText error={Boolean(fieldErrors.password)}>
									{fieldErrors.password
										? t(fieldErrors.password)
										: t(
												'Optional. Leave it empty if the user will sign in with 360dialog.'
										  )}
								</FormHelperText>
							</>
						)}
					</Styled.FieldsContainer>

					{error && <Alert severity="error">{t(error)}</Alert>}
				</DialogContent>
			)}

			<DialogActions>
				<Button onClick={close} color="secondary" disabled={isRequesting}>
					{createdUser ? t('Close') : t('Cancel')}
				</Button>
				{!createdUser && (
					<Button
						onClick={handleCreate}
						color="primary"
						disabled={isRequesting}
						data-test-id="create-user-submit-button"
					>
						{t('Create')}
					</Button>
				)}
			</DialogActions>
		</Styled.StyledDialog>
	);
};

export default CreateUserDialog;
