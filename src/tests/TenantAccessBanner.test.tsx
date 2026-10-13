import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TenantAccessBanner, {
	TenantReadOnlyFooter,
} from '@src/components/TenantAccessBanner';
import { CurrentTenant } from '@src/types/tenants';

const { useAppSelector } = require('@src/store/hooks');

const UPGRADE_URL = 'https://app.360dialog.com/upgrade';

const withTenant = (tenant: Partial<CurrentTenant> | undefined) =>
	useAppSelector.mockImplementation((selector: (state: any) => any) =>
		selector({
			currentTenant: {
				value: tenant && {
					id: 't1',
					name: 'Acme',
					phone_number: '4915100000001',
					access_mode: 'read_only',
					read_only_reason: 'trial_ended',
					upgrade_url: UPGRADE_URL,
					remove_at: '2026-12-19T10:13:30Z',
					...tenant,
				},
			},
		})
	);

describe('TenantAccessBanner', () => {
	it('is not shown with full access, or before the tenant is loaded', () => {
		for (const tenant of [{ access_mode: 'full' as const }, undefined]) {
			withTenant(tenant);
			const { container, unmount } = render(<TenantAccessBanner />);
			expect(container).toBeEmptyDOMElement();
			unmount();
		}
	});

	it('explains an ended free month and links to the upgrade', async () => {
		withTenant({});
		const open = jest.spyOn(window, 'open').mockImplementation(() => null);
		render(<TenantAccessBanner />);

		expect(
			screen.getByText(/Your free Inbox month has ended/)
		).toBeInTheDocument();
		await userEvent.click(screen.getByText('Upgrade to Premium'));
		expect(open).toHaveBeenCalledWith(UPGRADE_URL, '_blank', 'noopener');
	});

	it('has no upgrade button for a terminated channel, or without a URL', () => {
		for (const tenant of [
			{ read_only_reason: 'channel_terminated' as const },
			{ read_only_reason: 'not_premium' as const, upgrade_url: null },
		]) {
			withTenant(tenant);
			const { unmount } = render(<TenantAccessBanner />);
			expect(screen.queryByText('Upgrade to Premium')).not.toBeInTheDocument();
			unmount();
		}
	});
});

describe('TenantReadOnlyFooter', () => {
	it('says why nothing can be sent', () => {
		for (const [reason, text] of [
			['trial_ended', /free Inbox month has ended/],
			['not_premium', /not on Premium/],
			['channel_terminated', /has been terminated/],
			['removed', /no longer connected/],
		] as const) {
			withTenant({ read_only_reason: reason });
			const { unmount } = render(<TenantReadOnlyFooter />);
			expect(screen.getByText(text)).toBeInTheDocument();
			unmount();
		}
	});
});
