import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { setPasswordWithActivationCode } from '@src/api/authApi';
import * as Styled from './Login.styles';

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
				<Styled.LoginAlert severity="error">
					{errors.map((message) => (
						<div key={message}>{t(message)}</div>
					))}
				</Styled.LoginAlert>
			)}

			{username && (
				// Read-only rather than disabled, so a password manager files the
				// new password under this username
				<TextField
					variant="standard"
					value={username}
					label={t('Username')}
					autoComplete="username"
					InputProps={{ readOnly: true }}
					size="medium"
					fullWidth
				/>
			)}
			<TextField
				variant="standard"
				data-testid="new-password"
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				type="password"
				label={t('Password')}
				helperText={t(
					'At least 8 characters. Avoid common and entirely numeric passwords.'
				)}
				autoComplete="new-password"
				autoFocus
				size="medium"
				fullWidth
			/>
			<TextField
				variant="standard"
				data-testid="new-password-repeat"
				value={passwordRepeat}
				onChange={(event) => setPasswordRepeat(event.target.value)}
				type="password"
				label={t('Password (repeat)')}
				autoComplete="new-password"
				size="medium"
				fullWidth
			/>
			<Button
				data-testid="set-password-submit"
				type="submit"
				size="large"
				variant="contained"
				color="primary"
				fullWidth
				disableElevation
				disabled={isSubmitting}
			>
				{t('Set password')}
			</Button>
		</form>
	);
};

export default SetPasswordForm;
