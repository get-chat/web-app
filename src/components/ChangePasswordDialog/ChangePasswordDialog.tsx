import React, { useEffect, useRef, useState } from 'react';
import * as Styled from './ChangePasswordDialog.styles';
import {
	Button,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from '@mui/material';
import AlertTitle from '@mui/material/AlertTitle';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { changePassword } from '@src/api/authApi';
import Alert from '@mui/material/Alert';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const ChangePasswordDialog: React.FC<Props> = ({ open, setOpen }) => {
	const { t } = useTranslation();

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
	// English messages, translated one by one when shown
	const [errors, setErrors] = useState<string[]>([]);
	const [isRequesting, setRequesting] = useState(false);
	const [isSuccess, setSuccess] = useState(false);

	const timeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [timeoutRef]);

	const close = () => {
		setOpen(false);

		timeoutRef.current = setTimeout(function () {
			setCurrentPassword('');
			setNewPassword('');
			setNewPasswordRepeat('');
			setErrors([]);
			setRequesting(false);
			setSuccess(false);
		}, 300);
	};

	const handleChangePassword = async () => {
		if (
			currentPassword.length === 0 ||
			newPassword.length === 0 ||
			newPasswordRepeat.length === 0
		) {
			setErrors(['You must fill all fields!']);
			return;
		}

		if (newPassword !== newPasswordRepeat) {
			setErrors(['Passwords must match!']);
			return;
		}

		setSuccess(false);
		setErrors([]);
		setRequesting(true);

		try {
			await changePassword({
				current_password: currentPassword,
				new_password: newPassword,
			});
			setRequesting(false);
			setSuccess(true);
		} catch (error: any | AxiosError) {
			setRequesting(false);

			const data = error.response?.data;
			// A new password the validators turn down comes back as a list
			if (Array.isArray(data?.new_password)) {
				setErrors(data.new_password);
			} else {
				setErrors([data?.reason ?? 'An error has occurred.']);
			}
		}
	};

	return (
		<Styled.StyledDialog open={open} onClose={close} fullWidth>
			<DialogTitle>{t('Change password')}</DialogTitle>
			<DialogContent>
				<Styled.FieldsContainer>
					<TextField
						variant="standard"
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
						label={t('Current password')}
						type="password"
						autoComplete="current-password"
						autoFocus
						fullWidth
					/>

					<TextField
						variant="standard"
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
						label={t('New password')}
						type="password"
						autoComplete="new-password"
						fullWidth
					/>

					<TextField
						variant="standard"
						value={newPasswordRepeat}
						onChange={(event) => setNewPasswordRepeat(event.target.value)}
						label={t('New password (repeat)')}
						type="password"
						autoComplete="new-password"
						fullWidth
					/>
				</Styled.FieldsContainer>
				{errors.length > 0 && !isSuccess && (
					<Alert severity="error">
						<AlertTitle>{t('Error')}</AlertTitle>
						{errors.map((message) => (
							<div key={message}>{t(message)}</div>
						))}
					</Alert>
				)}
				{isSuccess && (
					<Alert severity="success">
						<AlertTitle>{t('Success')}</AlertTitle>
						{t('Changed password successfully')}
					</Alert>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button
					onClick={handleChangePassword}
					color="primary"
					disabled={isRequesting || isSuccess}
				>
					{t('Change')}
				</Button>
			</DialogActions>
		</Styled.StyledDialog>
	);
};

export default ChangePasswordDialog;
