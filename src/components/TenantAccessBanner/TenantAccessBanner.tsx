import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import ReportIcon from '@src/components/icons/Report';
import { Button } from '@src/components/ui/button';
import { useAppSelector } from '@src/store/hooks';

// Why the inbox is read-only (GC-72), across the top of the app. Draft copy:
// product supplies the final text.
const TenantAccessBanner: React.FC = () => {
	const { t } = useTranslation();
	const tenant = useAppSelector((state) => state.currentTenant.value);
	if (tenant?.access_mode !== 'read_only') return null;

	const removeAt = tenant.remove_at
		? moment(tenant.remove_at).format('LL')
		: '';
	const removal = t(
		'On %s we remove this Inbox with its conversations, contacts and tags. Upgrade the channel to Premium to keep everything.',
		removeAt
	);
	const canUpgrade =
		tenant.read_only_reason === 'trial_ended' ||
		tenant.read_only_reason === 'not_premium';

	let text;
	switch (tenant.read_only_reason) {
		case 'trial_ended':
			text = `${t(
				'Your free Inbox month has ended. Inbox is read-only: you can see every conversation, but you cannot send messages.'
			)} ${removal}`;
			break;
		case 'channel_terminated':
			text = t(
				'This WhatsApp channel has been terminated, so Inbox is read-only: you can see every conversation, but you cannot send messages.'
			);
			break;
		case 'removed':
			text = t(
				'This Inbox is no longer connected to your WhatsApp channel. You can read your conversations until %s; after that we delete them.',
				removeAt
			);
			break;
		default:
			text = `${t(
				'This channel is not on Premium, so Inbox is read-only: you can see every conversation, but you cannot send messages.'
			)} ${removal}`;
	}

	return (
		<div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 bg-warning-soft px-3.75 py-2.5 text-[14px] text-warning max-md:text-[13px]">
			<ReportIcon className="size-6! shrink-0 text-warning!" />
			<div className="min-w-0 flex-1 max-md:basis-[calc(100%-36px)]">
				{text}
			</div>
			{canUpgrade && tenant.upgrade_url && (
				<Button
					variant="unstyled"
					size="sm"
					className="h-auto shrink-0 bg-warning px-2.5 py-1 text-white hover:bg-warning/85 max-md:ml-9"
					onClick={() => window.open(tenant.upgrade_url!, '_blank', 'noopener')}
				>
					{t('Upgrade to Premium')}
				</Button>
			)}
		</div>
	);
};

// What takes the composer's place in every chat of a read-only inbox
export const TenantReadOnlyFooter: React.FC = () => {
	const { t } = useTranslation();
	const reason = useAppSelector(
		(state) => state.currentTenant.value?.read_only_reason
	);

	let text;
	switch (reason) {
		case 'trial_ended':
			text = t('Your free Inbox month has ended, so messages cannot be sent.');
			break;
		case 'channel_terminated':
			text = t(
				'This WhatsApp channel has been terminated, so messages cannot be sent.'
			);
			break;
		case 'removed':
			text = t(
				'This Inbox is no longer connected to your WhatsApp channel, so messages cannot be sent.'
			);
			break;
		default:
			text = t('This channel is not on Premium, so messages cannot be sent.');
	}

	return (
		<div className="border-l border-[lightgray] bg-[#f2edea] px-5 py-3.75 text-center text-[14px] text-[#736054]">
			{text}
		</div>
	);
};

export default TenantAccessBanner;
