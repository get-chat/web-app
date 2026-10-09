import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@src/components/icons/Check';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@src/components/ui/command';
import { Spinner } from '@src/components/ui/spinner';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { cn } from '@src/lib/utils';
import { Tenant } from '@src/types/tenants';
import InboxAvatar from './InboxAvatar';

// Above this many inboxes the list gets a search field
const SEARCH_THRESHOLD = 5;

// Accents and case don't matter: "cafe" finds "Café"
const normalize = (text: string) =>
	text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// A plain substring match on the name and number. Not cmdk's fuzzy default:
// it also matches the row's value, the hex id, where most short searches
// find their letters. An id matches only when (part of) one is pasted.
export const filterInboxes = (
	id: string,
	search: string,
	keywords?: string[]
) => {
	const query = normalize(search.trim());
	if (!query) return 1;
	const digits = query.replace(/[\s+()-]/g, '');
	const [name = '', phoneNumber = ''] = keywords ?? [];
	return normalize(name).includes(query) ||
		(/^\d+$/.test(digits) && phoneNumber.includes(digits)) ||
		(query.length >= 8 && id.includes(query))
		? 1
		: 0;
};

// The second line under an inbox's name: its number, unless the name already
// is the number (the backend's fallback for an unnamed inbox)
export const getInboxSubtitle = (tenant: Tenant) =>
	tenant.phone_number && tenant.name !== tenant.phone_number
		? addPlus(tenant.phone_number)
		: undefined;

export const getInboxTitle = (tenant: Tenant) =>
	tenant.name === tenant.phone_number ? addPlus(tenant.name) : tenant.name;

export const InboxLabel: React.FC<{ tenant: Tenant; className?: string }> = ({
	tenant,
	className,
}) => {
	const subtitle = getInboxSubtitle(tenant);
	return (
		<span className={cn('flex min-w-0 flex-1 flex-col', className)}>
			<span className="truncate font-medium">{getInboxTitle(tenant)}</span>
			{subtitle && (
				<span className="truncate text-[12px] text-menu-muted">{subtitle}</span>
			)}
		</span>
	);
};

interface Props {
	tenants: Tenant[];
	currentTenantId?: string;
	// The inbox being opened, shown with a spinner
	pendingTenantId?: string;
	heading?: string;
	onSelect: (tenant: Tenant) => void;
	className?: string;
	listClassName?: string;
}

const InboxList: React.FC<Props> = ({
	tenants,
	currentTenantId,
	pendingTenantId,
	heading,
	onSelect,
	className,
	listClassName,
}) => {
	const { t } = useTranslation();

	return (
		<Command
			className={className}
			// Arrow keys start from the current inbox
			defaultValue={currentTenantId}
			filter={filterInboxes}
			loop
		>
			{tenants.length > SEARCH_THRESHOLD && (
				<CommandInput placeholder={t('Find an inbox')} />
			)}
			<CommandList className={listClassName}>
				<CommandEmpty>{t('No inboxes found')}</CommandEmpty>
				<CommandGroup heading={heading}>
					{tenants.map((tenant) => {
						const isCurrent = tenant.id === currentTenantId;
						return (
							<CommandItem
								key={tenant.id}
								value={tenant.id}
								keywords={[tenant.name, tenant.phone_number]}
								// While one opens, the others wait
								disabled={!!pendingTenantId && tenant.id !== pendingTenantId}
								aria-current={isCurrent || undefined}
								className="min-h-13 gap-3 py-1.5"
								onSelect={() => !pendingTenantId && onSelect(tenant)}
								data-testid="inbox-option"
							>
								<InboxAvatar tenant={tenant} />
								<InboxLabel tenant={tenant} />
								{tenant.id === pendingTenantId ? (
									<Spinner size={18} />
								) : (
									isCurrent && (
										<CheckIcon
											className="text-selection!"
											aria-label={t('Current inbox')}
										/>
									)
								)}
							</CommandItem>
						);
					})}
				</CommandGroup>
			</CommandList>
		</Command>
	);
};

export default InboxList;
