import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestProviders } from '@src/__mocks__/test-utils';
import GroupInfo from './GroupInfo';
import { WhatsAppGroupDetail } from '@src/types/whatsappGroups';
import {
	canApproveJoinRequests,
	getRemainingParticipantSlots,
	isWhatsAppGroupFull,
} from '@src/helpers/WhatsAppGroupHelper';

jest.mock('@src/api/whatsappGroupsApi', () => ({
	fetchWhatsAppGroup: jest.fn(() => new Promise(() => {})),
}));

const { useAppSelector } = require('@src/store/hooks');

const participant = (index: number) => ({
	wa_id: `49151000000${index}`,
	name: `Participant ${index}`,
});

const joinRequest = (index: number) => ({
	join_request_id: `jr_${index}`,
	wa_id: `33661000000${index}`,
	name: `Requester ${index}`,
	creation_timestamp: 1763500000,
});

const buildGroup = (
	participants: number,
	joinRequests: number
): WhatsAppGroupDetail => ({
	id: 'b6c1e2a0-0000-0000-0000-000000000001',
	group_id: 'GROUP_ID',
	wa_id: 'GROUP_ID',
	status: 'active',
	error: null,
	subject: 'Acme onboarding',
	description: 'Kickoff and setup questions',
	join_approval_mode: 'approval_required',
	invite_link: 'https://chat.whatsapp.com/Gx7kQ2mLp',
	created_timestamp: 1758700000,
	max_participants: 8,
	participants: Array.from({ length: participants }, (_, i) => participant(i)),
	total_participant_count: participants,
	join_requests: Array.from({ length: joinRequests }, (_, i) => joinRequest(i)),
});

const renderWithGroup = (group: WhatsAppGroupDetail) => {
	useAppSelector.mockImplementation((selector: (state: any) => any) =>
		selector({
			UI: { currentWhatsAppGroup: group, isReadOnly: false },
			phoneNumber: { value: undefined },
			currentUser: { value: { id: 1, username: 'admin' } },
		})
	);
	return render(
		<TestProviders>
			<GroupInfo isExiting={false} onAnimationEnd={jest.fn()} />
		</TestProviders>
	);
};

const byTestId = (id: string) =>
	document.querySelector(`[data-test-id="${id}"]`) as HTMLElement;

describe('WhatsApp group participant limit', () => {
	it('counts the places left', () => {
		expect(getRemainingParticipantSlots(buildGroup(3, 0))).toBe(5);
		expect(getRemainingParticipantSlots(buildGroup(8, 0))).toBe(0);
		// Never negative, even if WhatsApp reports more than the limit
		expect(getRemainingParticipantSlots(buildGroup(9, 0))).toBe(0);
		expect(isWhatsAppGroupFull(buildGroup(8, 0))).toBe(true);
		expect(isWhatsAppGroupFull(buildGroup(7, 0))).toBe(false);
	});

	it('is unknown until the participants are loaded', () => {
		const group = {
			...buildGroup(0, 0),
			participants: undefined,
			total_participant_count: undefined,
		};
		expect(getRemainingParticipantSlots(group)).toBeUndefined();
		expect(isWhatsAppGroupFull(group)).toBe(false);
		expect(canApproveJoinRequests(group, 1)).toBe(false);
	});

	it('approves only as many join requests as there are places', () => {
		expect(canApproveJoinRequests(buildGroup(6, 3), 2)).toBe(true);
		expect(canApproveJoinRequests(buildGroup(6, 3), 3)).toBe(false);
	});
});

describe('GroupInfo', () => {
	it('shows the participant count against the limit', () => {
		renderWithGroup(buildGroup(3, 0));

		expect(byTestId('participant-count')).toHaveTextContent('3/8');
		expect(byTestId('add-participants')).toBeEnabled();
		expect(screen.getByText('Participant 1')).toBeInTheDocument();
	});

	it('disables adding participants and approving when the group is full', () => {
		renderWithGroup(buildGroup(8, 2));

		expect(byTestId('participant-count')).toHaveTextContent('8/8');
		expect(byTestId('add-participants')).toBeDisabled();
		screen
			.getAllByLabelText('Approve')
			.forEach((button) => expect(button).toBeDisabled());
		// Rejecting is still possible
		screen
			.getAllByLabelText('Reject')
			.forEach((button) => expect(button).toBeEnabled());
		expect(byTestId('approve-all')).toBeDisabled();
	});

	it('approves one by one, but not all, when only one place is left', () => {
		renderWithGroup(buildGroup(7, 2));

		screen
			.getAllByLabelText('Approve')
			.forEach((button) => expect(button).toBeEnabled());
		expect(byTestId('approve-all')).toBeDisabled();
	});

	it('approves all when there is room for every request', () => {
		renderWithGroup(buildGroup(5, 3));

		expect(byTestId('approve-all')).toBeEnabled();
	});
});

describe('Group participant colour', () => {
	it('stays the same for a participant and differs between participants', () => {
		const { getGroupParticipantColor } = jest.requireActual(
			'@src/helpers/WhatsAppGroupHelper'
		);
		const maria = { wa_id: '34612448190', name: 'María' };
		expect(getGroupParticipantColor(maria)).toBe(
			getGroupParticipantColor({ ...maria, name: 'María López' })
		);
		const colours = new Set(
			['34612448190', '4915122348812', '447594628892', '971543049363'].map(
				(wa_id) => getGroupParticipantColor({ wa_id })
			)
		);
		expect(colours.size).toBeGreaterThan(1);
	});
});
