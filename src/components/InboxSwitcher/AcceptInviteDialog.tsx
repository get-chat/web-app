import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { acceptInvite } from '@src/api/tenantsApi';
import { Alert } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@src/components/ui/dialog';
import { loadTenants } from '@src/helpers/InboxHelper';
import { getToken } from '@src/helpers/StorageHelper';
import useInboxSwitch from '@src/hooks/useInboxSwitch';
import useLogout from '@src/hooks/useLogout';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setTenants } from '@src/store/reducers/inboxesReducer';
import { setState } from '@src/store/reducers/UIReducer';
import { Tenant } from '@src/types/tenants';
import { getInboxTitle } from './InboxList';
import InboxPasswordDialog from './InboxPasswordDialog';
import InviteHero from './InviteHero';

// What to tell about a refused invite (the accept_invite 400), as a
// translation key: what happened and what to do about it
export const getInviteError = (data: any): string => {
	const message: string | undefined = (
		data?.code ??
		data?.non_field_errors ??
		data?.username ??
		data?.password
	)?.join(' ');
	switch (message) {
		case 'This invite is not valid (any more).':
			return 'This invite link has expired or was already used. Ask the inbox admin for a new one.';
		case 'This invite is for another account.':
			return 'This invite is for another account. Use that account to accept it.';
		case 'This account already has access to this inbox.':
			return 'You already have access to this inbox.';
		case 'This username is taken. To accept with that account, give its password.':
			return 'This username is taken. If it is yours, log in instead.';
		case 'Unable to log in with provided credentials.':
			return 'Incorrect username or password.';
		default:
			return message ?? 'An error has occurred. Please try again later.';
	}
};

// An invite link opened while logged in: accepted for the logged-in account,
// which can then open the inbox right away
const AcceptInviteDialog: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const logOut = useLogout();

	const inviteCode = useAppSelector((state) => state.UI.inviteCode);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const currentTenant = useAppSelector((state) =>
		state.inboxes.tenants.find(
			(tenant) => tenant.id === state.inboxes.currentTenantId
		)
	);
	const { username, switchTo, switchWithPassword } = useInboxSwitch();

	const [isBusy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [joinedTenant, setJoinedTenant] = useState<Tenant>();
	const [passwordTenant, setPasswordTenant] = useState<Tenant>();

	// A new invite starts afresh; not on closing, so the dialog keeps its
	// content while it fades out
	useEffect(() => {
		if (inviteCode) {
			setJoinedTenant(undefined);
			setError('');
		}
	}, [inviteCode]);

	const close = () => dispatch(setState({ inviteCode: undefined }));

	const accept = async () => {
		if (!inviteCode) return;
		setBusy(true);
		setError('');
		try {
			const { tenant } = await acceptInvite({ code: inviteCode });
			setJoinedTenant(tenant);
			// The new inbox joins the switcher
			dispatch(setTenants(await loadTenants(getToken())));
		} catch (error: any | AxiosError) {
			console.error(error);
			setError(getInviteError(error?.response?.data));
		} finally {
			setBusy(false);
		}
	};

	const open = async () => {
		if (!joinedTenant) return;
		setBusy(true);
		try {
			const result = await switchTo(joinedTenant);
			if (result === 'needsPassword') {
				setPasswordTenant(joinedTenant);
				close();
			}
		} catch (error: any | AxiosError) {
			window.displayError?.(error);
		} finally {
			setBusy(false);
		}
	};

	// The invite stays for the login card, which accepts it with the account
	// logged in there
	const switchAccount = () => logOut();

	const displayName =
		[currentUser?.first_name, currentUser?.last_name]
			.filter(Boolean)
			.join(' ') || username;

	return (
		<>
			<Dialog
				open={!!inviteCode}
				onOpenChange={(isOpen) => !isOpen && !isBusy && close()}
			>
				<DialogContent
					size="xs"
					className="sm:max-w-[400px]"
					// The dialog itself, not its first button: that is "Use another
					// account", which would open with a focus ring on it
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						(event.currentTarget as HTMLElement | null)?.focus();
					}}
				>
					<div className="flex flex-col items-center px-7 pt-8 pb-6 text-center max-md:px-5">
						<InviteHero
							user={currentUser}
							tenant={joinedTenant}
							className="mb-5"
						/>

						<DialogTitle className="pr-0 text-[20px]/[1.3] font-semibold tracking-[-0.01em] max-md:text-[18px]">
							{joinedTenant
								? t("You've joined %s", {
										postProcess: 'sprintf',
										sprintf: [getInboxTitle(joinedTenant)],
								  })
								: t("You're invited to an inbox")}
						</DialogTitle>
						<DialogDescription className="mt-1.5 max-w-[34ch] text-[14px]/[1.5]">
							{joinedTenant
								? t(
										'It is now next to your other inboxes, at the top of the sidebar.'
								  )
								: t(
										'Accept to add it to your account. You can switch between your inboxes at any time.'
								  )}
						</DialogDescription>

						{!joinedTenant && (
							<div className="mt-6 flex w-full items-center gap-3 rounded-[12px] bg-gray-lighter px-4 py-3 text-left">
								<div className="min-w-0 flex-1">
									<div className="text-[12px] text-muted-foreground">
										{t('Accepting as')}
									</div>
									<div className="truncate text-[14px] font-medium">
										{displayName}
										{displayName !== username && (
											<span className="font-normal text-muted-foreground">
												{' '}
												({username})
											</span>
										)}
									</div>
								</div>
								<Button
									variant="link"
									color="secondary"
									size="none"
									className="shrink-0 text-[13px]"
									disabled={isBusy}
									onClick={switchAccount}
								>
									{t('Use another account')}
								</Button>
							</div>
						)}

						{error && (
							<Alert className="mt-3 w-full text-left" severity="error">
								{t(error)}
							</Alert>
						)}

						<div className="mt-6 flex w-full flex-col gap-1">
							{joinedTenant ? (
								<Button
									size="lg"
									color="primary"
									className="w-full"
									loading={isBusy}
									onClick={open}
								>
									{t('Open %s', {
										postProcess: 'sprintf',
										sprintf: [getInboxTitle(joinedTenant)],
									})}
								</Button>
							) : (
								!error && (
									<Button
										size="lg"
										color="primary"
										className="w-full"
										loading={isBusy}
										onClick={accept}
										data-testid="accept-invite"
									>
										{t('Accept invite')}
									</Button>
								)
							)}
							<Button
								size="lg"
								variant="ghost"
								color="neutral"
								className="w-full text-muted-foreground"
								disabled={isBusy}
								onClick={close}
							>
								{joinedTenant && currentTenant
									? t('Stay in %s', {
											postProcess: 'sprintf',
											sprintf: [getInboxTitle(currentTenant)],
									  })
									: error
									? t('Close')
									: t('Not now')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<InboxPasswordDialog
				tenant={passwordTenant}
				username={username}
				onSubmit={switchWithPassword}
				onClose={() => setPasswordTenant(undefined)}
			/>
		</>
	);
};

export default AcceptInviteDialog;
