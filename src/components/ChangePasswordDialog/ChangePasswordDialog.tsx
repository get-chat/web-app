import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { changePassword } from '@src/api/authApi';
import { Alert, AlertTitle } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const ChangePasswordDialog: React.FC<Props> = ({ open, setOpen }) => {
	const { t } = useTranslation();

	const id = useId();

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
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{t('Change password')}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<div className="flex flex-col">
						<Field className="mb-2.5 gap-1.5">
							<FieldLabel htmlFor={`${id}-current-password`}>
								{t('Current password')}
							</FieldLabel>
							<Input
								id={`${id}-current-password`}
								value={currentPassword}
								onChange={(event) => setCurrentPassword(event.target.value)}
								type="password"
								autoComplete="current-password"
								autoFocus
							/>
						</Field>

						<Field className="mb-2.5 gap-1.5">
							<FieldLabel htmlFor={`${id}-new-password`}>
								{t('New password')}
							</FieldLabel>
							<Input
								id={`${id}-new-password`}
								value={newPassword}
								onChange={(event) => setNewPassword(event.target.value)}
								type="password"
								autoComplete="new-password"
							/>
						</Field>

						<Field className="mb-2.5 gap-1.5">
							<FieldLabel htmlFor={`${id}-new-password-repeat`}>
								{t('New password (repeat)')}
							</FieldLabel>
							<Input
								id={`${id}-new-password-repeat`}
								value={newPasswordRepeat}
								onChange={(event) => setNewPasswordRepeat(event.target.value)}
								type="password"
								autoComplete="new-password"
							/>
						</Field>
					</div>
					{errors.length > 0 && !isSuccess && (
						<Alert className="my-2.5" severity="error">
							<AlertTitle>{t('Error')}</AlertTitle>
							{errors.map((message) => (
								<div key={message}>{t(message)}</div>
							))}
						</Alert>
					)}
					{isSuccess && (
						<Alert className="my-2.5" severity="success">
							<AlertTitle>{t('Success')}</AlertTitle>
							{t('Changed password successfully')}
						</Alert>
					)}
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
					<Button
						variant="ghost"
						color="primary"
						onClick={handleChangePassword}
						disabled={isRequesting || isSuccess}
					>
						{t('Change')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ChangePasswordDialog;
