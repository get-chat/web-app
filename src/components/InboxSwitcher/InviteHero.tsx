import React from 'react';
import AddIcon from '@src/components/icons/Add';
import CheckIcon from '@src/components/icons/Check';
import InboxIcon from '@src/components/icons/Inbox';
import PersonIcon from '@src/components/icons/Person';
import CustomAvatar from '@src/components/CustomAvatar';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { cn } from '@src/lib/utils';
import { Tenant } from '@src/types/tenants';
import { User } from '@src/types/users';
import InboxAvatar from './InboxAvatar';

interface Props {
	// The account accepting; unknown on the login card
	user?: User;
	// The inbox, once joined: the invite itself does not say which it is
	tenant?: Tenant;
	className?: string;
}

// The person and the inbox the invite links them to. The link is dashed while
// the invite is open; joining draws it and fills in the inbox.
const InviteHero: React.FC<Props> = ({ user, tenant, className }) => {
	const isJoined = !!tenant;

	return (
		<div
			aria-hidden
			className={cn('flex items-center justify-center', className)}
		>
			{user ? (
				<CustomAvatar
					className="size-14 text-[22px]/none ring-4 ring-white"
					src={user.profile?.large_avatar ?? user.profile?.avatar}
					generateBgColorBy={user.username}
				>
					{generateInitialsHelper(user.username)}
				</CustomAvatar>
			) : (
				<span className="flex size-14 items-center justify-center rounded-full bg-gray-lighter ring-4 ring-white">
					<PersonIcon className="size-7! text-ink/35!" />
				</span>
			)}

			<span className="relative mx-2 flex w-24 items-center justify-center">
				{/* Dashes drawn with a gradient: a dashed border's dashes are too
				    short at 2px */}
				<span
					className={cn(
						'absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full',
						isJoined
							? 'bg-primary'
							: 'bg-[repeating-linear-gradient(90deg,rgb(0_0_45/0.18)_0_6px,transparent_6px_11px)]'
					)}
				/>
				<span
					className={cn(
						'relative flex size-7 items-center justify-center rounded-full border transition-colors duration-300 motion-reduce:transition-none',
						isJoined ? 'border-primary bg-primary' : 'border-ink/15 bg-white'
					)}
				>
					{isJoined ? (
						<CheckIcon className="size-[18px]! text-white! animate-in zoom-in-50 duration-300 motion-reduce:animate-none" />
					) : (
						<AddIcon className="size-[18px]! text-ink/45!" />
					)}
				</span>
			</span>

			{tenant ? (
				<InboxAvatar
					key={tenant.id}
					tenant={tenant}
					className="size-14 rounded-[16px] text-[20px]/none ring-4 ring-white animate-in fade-in zoom-in-75 duration-300 motion-reduce:animate-none"
				/>
			) : (
				<span className="flex size-14 items-center justify-center rounded-[16px] border-2 border-dashed border-ink/20 bg-gray-lighter">
					<InboxIcon className="size-7! text-ink/35!" />
				</span>
			)}
		</div>
	);
};

export default InviteHero;
