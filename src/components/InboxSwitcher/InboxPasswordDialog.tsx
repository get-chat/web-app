import React, { useEffect, useId, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { Alert } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import { Tenant } from '@src/types/tenants';
import InboxAvatar from './InboxAvatar';
import { getInboxTitle, InboxLabel } from './InboxList';

interface Props {
	// The inbox to open; the dialog is open while it is set
	tenant: Tenant | undefined;
	username: string;
	onSubmit: (tenant: Tenant, password: string) => Promise<void>;
	onClose: () => void;
}

// Asked the first time this device opens one of the account's other inboxes,
// when no backend session can vouch for the account: a token opens only its
// own inbox, the password opens them all
const InboxPasswordDialog: React.FC<Props> = ({
	tenant,
	username,
	onSubmit,
	onClose,
}) => {
	const { t } = useTranslation();
	const id = useId();

	// Still shown while the dialog fades out after `tenant` was unset
	const shownTenantRef = useRef(tenant);
	if (tenant) shownTenantRef.current = tenant;
	const shownTenant = shownTenantRef.current;

	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (tenant) {
			setPassword('');
			setError('');
			setSubmitting(false);
		}
	}, [tenant]);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!tenant || !password) return;

		setSubmitting(true);
		setError('');
		try {
			await onSubmit(tenant, password);
		} catch (error: any | AxiosError) {
			console.error(error);
			setSubmitting(false);
			const reason = error?.response?.data?.reason;
			if (error?.response?.status === 400) {
				setError(t('Incorrect password.'));
			} else if (reason) {
				setError(reason);
			} else {
				setError(t('An error has occurred. Please try again later.'));
			}
		}
	};

	return (
		<Dialog
			open={!!tenant}
			onOpenChange={(isOpen) => !isOpen && !isSubmitting && onClose()}
		>
			<DialogContent size="xs">
				<form onSubmit={submit}>
					<DialogHeader>
						<DialogTitle>
							{t('Open %s', {
								postProcess: 'sprintf',
								sprintf: [shownTenant ? getInboxTitle(shownTenant) : ''],
							})}
						</DialogTitle>
						<DialogDescription className="text-[14px]">
							<Trans>
								Confirm it's you to open this inbox. You only need to do this
								once on this device.
							</Trans>
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="pt-2.5 pb-4">
						{shownTenant && (
							<div className="mb-4 flex items-center gap-3 rounded-[10px] bg-gray-lighter px-3 py-2.5 text-sm">
								<InboxAvatar tenant={shownTenant} />
								<InboxLabel tenant={shownTenant} />
							</div>
						)}
						{error && (
							<Alert className="mb-3" severity="error">
								{error}
							</Alert>
						)}
						{/* For password managers: the account the password is for */}
						<input
							type="text"
							name="username"
							autoComplete="username"
							value={username}
							readOnly
							hidden
						/>
						<Field>
							<FieldLabel htmlFor={`${id}-password`}>
								{t('Password of %s', {
									postProcess: 'sprintf',
									sprintf: [username],
								})}
							</FieldLabel>
							<Input
								id={`${id}-password`}
								type="password"
								autoComplete="current-password"
								autoFocus
								value={password}
								aria-invalid={!!error || undefined}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</Field>
					</DialogBody>
					<DialogFooter>
						<Button
							variant="ghost"
							color="secondary"
							disabled={isSubmitting}
							onClick={onClose}
						>
							{t('Cancel')}
						</Button>
						<Button
							type="submit"
							color="primary"
							loading={isSubmitting}
							disabled={!password}
						>
							{t('Open inbox')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default InboxPasswordDialog;
