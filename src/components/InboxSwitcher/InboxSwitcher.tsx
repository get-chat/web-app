import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import ContentCopyIcon from '@src/components/icons/ContentCopy';
import UnfoldMoreIcon from '@src/components/icons/UnfoldMore';
import { Button } from '@src/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@src/components/ui/popover';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import useInboxSwitch from '@src/hooks/useInboxSwitch';
import { useAppSelector } from '@src/store/hooks';
import { Tenant } from '@src/types/tenants';
import InboxAvatar from './InboxAvatar';
import InboxList, { InboxLabel } from './InboxList';
import InboxPasswordDialog from './InboxPasswordDialog';

/*
 * The inbox the app is in, at the top of the sidebar, and a menu of the
 * account's other inboxes (MT 3.6). Rendered only for accounts in more than
 * one inbox: everybody else sees no change.
 */
const InboxSwitcher: React.FC = () => {
	const { t } = useTranslation();

	const { tenants, currentTenantId } = useAppSelector((state) => state.inboxes);
	const { username, switchTo, switchWithPassword } = useInboxSwitch();

	const [isOpen, setOpen] = useState(false);
	const [pendingTenant, setPendingTenant] = useState<Tenant>();
	const [passwordTenant, setPasswordTenant] = useState<Tenant>();

	const current = tenants.find((tenant) => tenant.id === currentTenantId);

	const onSelect = async (tenant: Tenant) => {
		if (tenant.id === currentTenantId) {
			setOpen(false);
			return;
		}

		setPendingTenant(tenant);
		try {
			const result = await switchTo(tenant);
			if (result === 'needsPassword') {
				setOpen(false);
				setPasswordTenant(tenant);
			}
		} catch (error: any | AxiosError) {
			console.error(error);
			window.displayError?.(error);
		} finally {
			setPendingTenant(undefined);
		}
	};

	const copyId = async () => {
		if (!current || !navigator.clipboard) return;
		await navigator.clipboard.writeText(current.id);
		window.displaySuccess?.('Inbox ID copied');
	};

	return (
		// relative z-1: the card's shadow and focus ring reach below this box, where
		// the header row after it would paint over them
		<div className="relative z-1 shrink-0 bg-gray-light px-3.75 pt-2.5 max-md:px-2.5">
			<Popover open={isOpen} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] border border-[rgba(0,0,45,0.08)] bg-white/65 py-[7px] pr-[7px] pl-[9px] text-left [font:inherit] text-inherit shadow-[0_1px_2px_rgba(0,0,45,0.05)] transition-colors duration-150 outline-none! hover:bg-white focus-visible:shadow-[0_0_0_2px_var(--primary)]"
						aria-label={t('Switch inbox')}
						data-testid="inbox-switcher"
					>
						{current ? (
							<>
								<InboxAvatar tenant={current} className="size-9" />
								<InboxLabel tenant={current} className="text-[14px]" />
							</>
						) : (
							// The current inbox could not be told apart (an inbox
							// without a WhatsApp number): still offer the others
							<span className="flex-1 px-1 text-[14px] font-medium">
								{t('Switch inbox')}
							</span>
						)}
						<UnfoldMoreIcon className="size-5! shrink-0 text-menu-icon!" />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-(--radix-popover-trigger-width) min-w-[280px] overflow-hidden p-0"
				>
					<InboxList
						tenants={tenants}
						currentTenantId={currentTenantId}
						pendingTenantId={pendingTenant?.id}
						heading={t('Your inboxes')}
						onSelect={onSelect}
					/>
					{current && (
						<div className="flex items-center gap-2 border-t border-menu-divider py-1.5 pr-2 pl-4 text-[12px] text-menu-muted">
							<span className="shrink-0">{t('Inbox ID')}</span>
							<code
								className="min-w-0 flex-1 truncate font-mono text-[11.5px]"
								title={current.id}
							>
								{current.id}
							</code>
							<SimpleTooltip title={t('Copy')} disableHoverableContent>
								<Button
									variant="ghost"
									color="neutral"
									size="icon-sm"
									aria-label={t('Copy inbox ID')}
									onClick={copyId}
								>
									<ContentCopyIcon className="size-4! text-menu-icon!" />
								</Button>
							</SimpleTooltip>
						</div>
					)}
				</PopoverContent>
			</Popover>

			<InboxPasswordDialog
				tenant={passwordTenant}
				username={username}
				onSubmit={switchWithPassword}
				onClose={() => setPasswordTenant(undefined)}
			/>
		</div>
	);
};

export default InboxSwitcher;
