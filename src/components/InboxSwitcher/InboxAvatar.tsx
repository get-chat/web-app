import React, { useMemo } from 'react';
import InboxIcon from '@src/components/icons/Inbox';
import { cn } from '@src/lib/utils';
import { Tenant } from '@src/types/tenants';

// Up to two initials of the inbox name: "Acme Support" → "AS". A name without
// letters is the phone number the backend falls back to: no initials then.
export const getInboxInitials = (name: string) =>
	name
		.split(/\s+/)
		.map((word) => word.match(/\p{L}|\d/u)?.[0] ?? '')
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();

// Deep enough for white initials (WCAG AA), apart enough to tell inboxes apart
const COLORS = [
	'#1f5bd8',
	'#17604c',
	'#6d3fd1',
	'#b4460f',
	'#0e6f86',
	'#b0275d',
	'#4b6d10',
	'#8a5a00',
];

// FNV-1a with a final mix: the low bits of a plain `hash * 31` depend on
// little more than an alternating sum of the characters, so similar ids
// would share a colour
const getColor = (id: string) => {
	let hash = 0x811c9dc5;
	for (let i = 0; i < id.length; i++) {
		hash = Math.imul(hash ^ id.charCodeAt(i), 0x01000193);
	}
	hash ^= hash >>> 16;
	hash = Math.imul(hash, 0x45d9f3b);
	hash ^= hash >>> 16;
	return COLORS[(hash >>> 0) % COLORS.length];
};

interface Props {
	tenant: Tenant;
	className?: string;
}

// A rounded square, unlike the round avatars of people: an inbox is a
// business (one WhatsApp number). Coloured by its id, so it keeps its colour
// when renamed.
const InboxAvatar: React.FC<Props> = ({ tenant, className }) => {
	const initials = /\p{L}/u.test(tenant.name)
		? getInboxInitials(tenant.name)
		: '';
	const color = useMemo(() => getColor(tenant.id), [tenant.id]);

	return (
		<span
			aria-hidden
			className={cn(
				'inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] text-[13px]/none font-semibold tracking-[0.02em] text-white shadow-[inset_0_0_0_1px_rgba(0,0,45,0.08)] select-none',
				className
			)}
			style={{ backgroundColor: color }}
		>
			{initials || <InboxIcon className="size-[60%]! text-white!" />}
		</span>
	);
};

export default InboxAvatar;
