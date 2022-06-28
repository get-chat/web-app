import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/ChangePasswordDialog.css';
import { Button, Dialog, TextField } from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../../../contexts/ApplicationContext';

function ChangePasswordDialog(props) {
	const { apiService } = React.useContext(ApplicationContext);

	const { t, i18n } = useTranslation();

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
	const [error, setError] = useState();
	const [isRequesting, setRequesting] = useState(false);
	const [isSuccess, setSuccess] = useState(false);

	const timeoutRef = useRef(0);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [timeoutRef]);

	const close = () => {
		// Close dialog
		props.setOpen(false);

		timeoutRef.current = setTimeout(function () {
			// Reset states
			setCurrentPassword('');
			setNewPassword('');
			setNewPasswordRepeat('');
			setError(undefined);
			setRequesting(false);
			setSuccess(false);
		}, 300);
	};

	const changePassword = async () => {
		if (
			currentPassword.length === 0 ||
			newPassword.length === 0 ||
			newPasswordRepeat.length === 0
		) {
			setError('You must fill all fields!');
			return;
		}

		if (newPassword !== newPasswordRepeat) {
			setError('Passwords must match!');
			return;
		}

		setSuccess(false);
		setError(undefined);
		setRequesting(true);

		apiService.changePasswordCall(
			currentPassword,
			newPassword,
			(response) => {
				setRequesting(false);
				setSuccess(true);
			},
			(error) => {
				setRequesting(false);
				setError(error.response?.data?.reason ?? 'An error has occurred.');
			}
		);
	};

	return (
		<Dialog open={props.open} onClose={close} className="changePasswordDialog">
			<DialogTitle>Change password</DialogTitle>
			<DialogContent>
				<div className="changePasswordDialog__fields">
					<TextField
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
						label={t('Current password')}
						type="password"
						autoFocus
						fullWidth
					/>

					<TextField
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
						label={t('New password')}
						type="password"
						fullWidth
					/>

					<TextField
						value={newPasswordRepeat}
						onChange={(event) => setNewPasswordRepeat(event.target.value)}
						label={t('New password (repeat)')}
						type="password"
						fullWidth
					/>
				</div>
				{error && !isSuccess && (
					<Alert severity="error">
						<AlertTitle>{t('Error')}</AlertTitle>
						{t(error)}
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
					onClick={changePassword}
					color="primary"
					disabled={isRequesting || isSuccess}
				>
					{t('Change')}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ChangePasswordDialog;
