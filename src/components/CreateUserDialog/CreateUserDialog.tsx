import React, { useEffect, useId, useRef, useState } from 'react';
import * as Styled from './CreateUserDialog.styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Trans, useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { changeUserPassword, createUser } from '@src/api/usersApi';
import {
	CreateUserRequest,
	CreateUserResponse,
	UserRole,
} from '@src/types/users';
import { USER_ROLE_LABELS } from '@src/helpers/UserHelper';
import { Alert } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';
import { SimpleTooltip } from '@src/components/ui/tooltip';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	// Called once the user exists, so a caller showing a user list can refresh it
	onCreated?: () => void;
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

const CreateUserDialog: React.FC<Props> = ({ open, setOpen, onCreated }) => {
	const { t } = useTranslation();

	const id = useId();

	const [username, setUsername] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<UserRole>('user');
	const [password, setPassword] = useState('');
	const [passwordRepeat, setPasswordRepeat] = useState('');

	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [error, setError] = useState<string>();
	// English messages, translated one by one when shown
	const [warnings, setWarnings] = useState<string[]>([]);
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
			setWarnings([]);
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
		setWarnings([]);

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
				// The validators' messages come back as a list: keep them apart,
				// so each one is translated on its own
				const reasons = error?.response?.data?.password;
				setWarnings([
					'The user was created, but the password could not be set.',
					...(Array.isArray(reasons) ? reasons : []),
					'They can choose their own password with the activation link.',
				]);
			}
		}

		setRequesting(false);
		setCreatedUser(user);
		onCreated?.();
	};

	const copyActivationLink = async () => {
		if (!createdUser || !navigator.clipboard) return;

		await navigator.clipboard.writeText(createdUser.activation_url);
		window.displaySuccess('Copied!');
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<Styled.StyledDialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>
						{createdUser ? t('User created') : t('Create new user')}
					</DialogTitle>
				</DialogHeader>

				{createdUser ? (
					<DialogBody>
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

						{createdUser.activation_email_sent ? (
							<Alert severity="info" icon={<MarkEmailReadIcon />}>
								<Trans
									values={{
										postProcess: 'sprintf',
										sprintf: [createdUser.email],
									}}
								>
									Activation e-mail sent to <span className="bold">%s</span>.
								</Trans>
							</Alert>
						) : (
							<Alert severity="info">
								{isAppRole
									? t(
											'App integrations are not e-mailed. Use the activation link below to get their API token.'
									  )
									: t(
											'No activation e-mail was sent, so the user needs the activation link below from you.'
									  )}
							</Alert>
						)}

						<Styled.SectionLabel>{t('Activation link')}</Styled.SectionLabel>
						<Styled.ActivationLinkContainer>
							<Styled.ActivationLink>
								{createdUser.activation_url}
							</Styled.ActivationLink>
							<SimpleTooltip title={t('Copy')}>
								<Button
									variant="ghost"
									color="neutral"
									size="icon-sm"
									onClick={copyActivationLink}
								>
									<ContentCopyIcon className="size-5" />
								</Button>
							</SimpleTooltip>
						</Styled.ActivationLinkContainer>

						<Alert severity="warning">
							{isAppRole
								? t(
										'This link is shown only once. Opening it activates the user and returns the API token, which cannot be retrieved with this link again.'
								  )
								: createdUser.activation_email_sent
								? t(
										'This link is shown only once. Keep it in case the e-mail does not arrive.'
								  )
								: t(
										'This link is shown only once. The account is ready to be used after the link is opened.'
								  )}
						</Alert>

						{warnings.length > 0 && (
							<Alert severity="warning">
								{warnings.map((message) => (
									<div key={message}>{t(message)}</div>
								))}
							</Alert>
						)}
					</DialogBody>
				) : (
					<DialogBody>
						<Styled.FieldsContainer>
							<Field
								className="gap-1.5"
								data-invalid={Boolean(fieldErrors.username) || undefined}
							>
								<FieldLabel htmlFor={`${id}-username`}>
									{`${t('Username')} *`}
								</FieldLabel>
								<Input
									id={`${id}-username`}
									variant="underline"
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									aria-invalid={Boolean(fieldErrors.username) || undefined}
									autoComplete="off"
									autoFocus
									required
								/>
								{fieldErrors.username ? (
									<FieldError>{t(fieldErrors.username)}</FieldError>
								) : (
									<FieldDescription>
										{t('Only letters and numbers are allowed.')}
									</FieldDescription>
								)}
							</Field>

							<Styled.FieldsRow>
								<Field
									className="gap-1.5"
									data-invalid={Boolean(fieldErrors.first_name) || undefined}
								>
									<FieldLabel htmlFor={`${id}-first-name`}>
										{t('First name')}
									</FieldLabel>
									<Input
										id={`${id}-first-name`}
										variant="underline"
										value={firstName}
										onChange={(event) => setFirstName(event.target.value)}
										aria-invalid={Boolean(fieldErrors.first_name) || undefined}
										autoComplete="off"
									/>
									{fieldErrors.first_name && (
										<FieldError>{t(fieldErrors.first_name)}</FieldError>
									)}
								</Field>

								<Field
									className="gap-1.5"
									data-invalid={Boolean(fieldErrors.last_name) || undefined}
								>
									<FieldLabel htmlFor={`${id}-last-name`}>
										{t('Last name')}
									</FieldLabel>
									<Input
										id={`${id}-last-name`}
										variant="underline"
										value={lastName}
										onChange={(event) => setLastName(event.target.value)}
										aria-invalid={Boolean(fieldErrors.last_name) || undefined}
										autoComplete="off"
									/>
									{fieldErrors.last_name && (
										<FieldError>{t(fieldErrors.last_name)}</FieldError>
									)}
								</Field>
							</Styled.FieldsRow>

							<Field
								className="gap-1.5"
								data-invalid={Boolean(fieldErrors.email) || undefined}
							>
								<FieldLabel htmlFor={`${id}-email`}>{t('E-mail')}</FieldLabel>
								<Input
									id={`${id}-email`}
									variant="underline"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									type="email"
									aria-invalid={Boolean(fieldErrors.email) || undefined}
									autoComplete="off"
								/>
								{fieldErrors.email && (
									<FieldError>{t(fieldErrors.email)}</FieldError>
								)}
							</Field>

							<Field className="gap-1.5">
								<FieldLabel htmlFor="create-user-role-select">
									{t('Role')}
								</FieldLabel>
								<Select
									value={role}
									onValueChange={(value) => setRole(value as UserRole)}
								>
									<SelectTrigger
										id="create-user-role-select"
										variant="underline"
										className="w-full"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
											<SelectItem key={value} value={value}>
												{t(label)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FieldDescription>
									{t(ROLE_DESCRIPTIONS[role])}
								</FieldDescription>
							</Field>

							{!isAppRole && (
								<>
									<Styled.FieldsRow>
										<Field
											className="gap-1.5"
											data-invalid={Boolean(fieldErrors.password) || undefined}
										>
											<FieldLabel htmlFor={`${id}-password`}>
												{t('Password')}
											</FieldLabel>
											<Input
												id={`${id}-password`}
												variant="underline"
												value={password}
												onChange={(event) => setPassword(event.target.value)}
												type="password"
												aria-invalid={
													Boolean(fieldErrors.password) || undefined
												}
												autoComplete="new-password"
											/>
										</Field>

										<Field
											className="gap-1.5"
											data-invalid={Boolean(fieldErrors.password) || undefined}
										>
											<FieldLabel htmlFor={`${id}-password-repeat`}>
												{t('Password (repeat)')}
											</FieldLabel>
											<Input
												id={`${id}-password-repeat`}
												variant="underline"
												value={passwordRepeat}
												onChange={(event) =>
													setPasswordRepeat(event.target.value)
												}
												type="password"
												aria-invalid={
													Boolean(fieldErrors.password) || undefined
												}
												autoComplete="new-password"
											/>
										</Field>
									</Styled.FieldsRow>

									{fieldErrors.password ? (
										<FieldError>{t(fieldErrors.password)}</FieldError>
									) : (
										<FieldDescription>
											{t(
												'Optional. Leave it empty if the user will sign in with 360dialog.'
											)}
										</FieldDescription>
									)}
								</>
							)}
						</Styled.FieldsContainer>

						{error && <Alert severity="error">{t(error)}</Alert>}
					</DialogBody>
				)}

				<DialogFooter>
					<Button
						variant="ghost"
						color="secondary"
						onClick={close}
						disabled={isRequesting}
					>
						{createdUser ? t('Close') : t('Cancel')}
					</Button>
					{!createdUser && (
						<Button
							variant="ghost"
							color="primary"
							onClick={handleCreate}
							disabled={isRequesting}
							data-test-id="create-user-submit-button"
						>
							{t('Create')}
						</Button>
					)}
				</DialogFooter>
			</Styled.StyledDialogContent>
		</Dialog>
	);
};

export default CreateUserDialog;
