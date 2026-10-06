import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { setPasswordWithActivationCode } from '@src/api/authApi';
import { Button } from '@src/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import { Alert } from '@src/components/ui/alert';
import {
	loginAlertClassName,
	loginFieldClassName,
	loginSubmitClassName,
} from './loginClassNames';

interface Props {
	code: string;
	username: string | undefined;
	onPasswordSet: (username: string) => void;
	onInvalidCode: () => void;
}

// Rendered in place of the login form while the login card holds the code of
// an activation link: a regular user has no usable password before this, and
// no other way to get one
const SetPasswordForm: React.FC<Props> = ({
	code,
	username,
	onPasswordSet,
	onInvalidCode,
}) => {
	const { t } = useTranslation();

	const idPrefix = useId();

	const [password, setPassword] = useState('');
	const [passwordRepeat, setPasswordRepeat] = useState('');
	const [errors, setErrors] = useState<string[]>([]);
	const [isSubmitting, setSubmitting] = useState(false);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (password.length === 0) {
			setErrors(['You must fill all fields!']);
			return;
		}

		if (password !== passwordRepeat) {
			setErrors(['Passwords must match.']);
			return;
		}

		setErrors([]);
		setSubmitting(true);

		try {
			const data = await setPasswordWithActivationCode({ code, password });
			onPasswordSet(data.username);
		} catch (error: any | AxiosError) {
			setSubmitting(false);

			const data = error?.response?.data;

			// Used already, mistyped, or not a regular user's: nothing to retry
			if (data?.code) {
				onInvalidCode();
				return;
			}

			// The password validators' messages, in English: translated below
			if (Array.isArray(data?.password)) {
				setErrors(data.password);
				return;
			}

			setErrors(['An error has occurred.']);
		}
	};

	return (
		<form onSubmit={submit}>
			{errors.length > 0 && (
				<Alert className={loginAlertClassName} severity="error">
					{errors.map((message) => (
						<div key={message}>{t(message)}</div>
					))}
				</Alert>
			)}

			{username && (
				// Read-only rather than disabled, so a password manager files the
				// new password under this username
				<Field className={loginFieldClassName}>
					<FieldLabel htmlFor={`${idPrefix}-username`}>
						{t('Username')}
					</FieldLabel>
					<Input
						id={`${idPrefix}-username`}
						value={username}
						autoComplete="username"
						readOnly
					/>
				</Field>
			)}
			<Field data-testid="new-password" className={loginFieldClassName}>
				<FieldLabel htmlFor={`${idPrefix}-password`}>
					{t('Password')}
				</FieldLabel>
				<Input
					id={`${idPrefix}-password`}
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					type="password"
					aria-describedby={`${idPrefix}-password-description`}
					autoComplete="new-password"
					autoFocus
				/>
				<FieldDescription id={`${idPrefix}-password-description`}>
					{t(
						'At least 8 characters. Avoid common and entirely numeric passwords.'
					)}
				</FieldDescription>
			</Field>
			<Field data-testid="new-password-repeat" className={loginFieldClassName}>
				<FieldLabel htmlFor={`${idPrefix}-password-repeat`}>
					{t('Password (repeat)')}
				</FieldLabel>
				<Input
					id={`${idPrefix}-password-repeat`}
					value={passwordRepeat}
					onChange={(event) => setPasswordRepeat(event.target.value)}
					type="password"
					autoComplete="new-password"
				/>
			</Field>
			<Button
				data-testid="set-password-submit"
				type="submit"
				size="lg"
				variant="solid"
				color="primary"
				className={loginSubmitClassName}
				disabled={isSubmitting}
			>
				{t('Set password')}
			</Button>
		</form>
	);
};

export default SetPasswordForm;
