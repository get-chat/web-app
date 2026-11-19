import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@src/__mocks__/test-utils';
import CreateGroupDialog from './CreateGroupDialog';
import CreateGroupEntry from './CreateGroupEntry';
import {
	createWhatsAppGroup,
	fetchWhatsAppGroup,
	fetchWhatsAppGroupEligibility,
} from '@src/api/whatsappGroupsApi';

jest.mock('@src/api/whatsappGroupsApi', () => ({
	createWhatsAppGroup: jest.fn(),
	fetchWhatsAppGroup: jest.fn(),
	fetchWhatsAppGroupEligibility: jest.fn(),
}));

const mockCreate = createWhatsAppGroup as jest.Mock;
const mockFetch = fetchWhatsAppGroup as jest.Mock;
const mockEligibility = fetchWhatsAppGroupEligibility as jest.Mock;

const group = (overrides: object = {}) => ({
	id: 'b6c1e2a0-0000-0000-0000-000000000001',
	group_id: null,
	wa_id: null,
	status: 'creating',
	error: null,
	subject: 'Acme onboarding',
	description: '',
	join_approval_mode: 'approval_required',
	invite_link: null,
	created_timestamp: null,
	max_participants: 8,
	...overrides,
});

const renderDialog = (onCreated = jest.fn()) => {
	render(
		<TestProviders>
			<CreateGroupDialog open onClose={jest.fn()} onCreated={onCreated} />
		</TestProviders>
	);
	return onCreated;
};

const submitButton = () =>
	document.querySelector(
		'[data-test-id="create-group-submit"]'
	) as HTMLButtonElement;
const subjectInput = () =>
	document.querySelector(
		'[data-test-id="group-subject-input"]'
	) as HTMLInputElement;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('CreateGroupDialog', () => {
	it('needs a subject, and caps subject and description lengths', async () => {
		renderDialog();

		expect(submitButton()).toBeDisabled();

		// Spaces only are not a subject
		await userEvent.type(subjectInput(), '   ');
		expect(submitButton()).toBeDisabled();

		await userEvent.type(subjectInput(), 'Acme onboarding');
		expect(submitButton()).toBeEnabled();

		expect(subjectInput()).toHaveAttribute('maxLength', '128');
		expect(
			screen.getByPlaceholderText('What is this group for?')
		).toHaveAttribute('maxLength', '2048');
	});

	it('sends the trimmed subject and join mode, then opens an active group', async () => {
		mockCreate.mockResolvedValue(
			group({ status: 'active', wa_id: 'GROUP_ID', group_id: 'GROUP_ID' })
		);
		const onCreated = renderDialog();

		await userEvent.type(subjectInput(), '  Acme onboarding ');
		await userEvent.click(screen.getByText('Anyone with the link'));
		await userEvent.click(submitButton());

		expect(mockCreate).toHaveBeenCalledWith({
			subject: 'Acme onboarding',
			description: undefined,
			join_approval_mode: 'auto_approve',
		});
		await waitFor(() => expect(onCreated).toHaveBeenCalledWith('GROUP_ID'));
	});

	it('waits while WhatsApp creates the group, and shows why it failed', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
		mockCreate.mockResolvedValue(group());
		mockFetch.mockResolvedValue(
			group({ status: 'create_failed', error: 'Group creation is disabled' })
		);
		const onCreated = renderDialog();

		await user.type(subjectInput(), 'Acme onboarding');
		await user.click(submitButton());

		expect(await screen.findByText('Creating group…')).toBeInTheDocument();

		await act(async () => {
			jest.advanceTimersByTime(2000);
		});

		expect(
			await screen.findByText('Group creation is disabled')
		).toBeInTheDocument();
		expect(onCreated).not.toHaveBeenCalled();
		jest.useRealTimers();
	});

	it('shows the API error when creating fails', async () => {
		mockCreate.mockRejectedValue({
			response: { data: { detail: 'This number cannot create groups.' } },
		});
		renderDialog();

		await userEvent.type(subjectInput(), 'Acme onboarding');
		await userEvent.click(submitButton());

		expect(
			await screen.findByText('This number cannot create groups.')
		).toBeInTheDocument();
	});
});

describe('CreateGroupEntry', () => {
	const entryButton = () =>
		document.querySelector(
			'[data-test-id="create-group"]'
		) as HTMLButtonElement;

	it('is disabled and says why when the number cannot have groups', async () => {
		mockEligibility.mockResolvedValue({
			eligible: false,
			reason: 'coexistence',
		});
		render(
			<TestProviders>
				<CreateGroupEntry onCreated={jest.fn()} />
			</TestProviders>
		);

		expect(
			await screen.findByText(
				'Groups are not available for numbers that also use the WhatsApp Business app (Coexistence).'
			)
		).toBeInTheDocument();
		expect(entryButton()).toBeDisabled();
	});

	it('opens the dialog when the number is eligible', async () => {
		mockEligibility.mockResolvedValue({ eligible: true, reason: null });
		render(
			<TestProviders>
				<CreateGroupEntry onCreated={jest.fn()} />
			</TestProviders>
		);

		await waitFor(() => expect(entryButton()).toBeEnabled());
		await userEvent.click(entryButton());

		expect(
			screen.getByText('Who can join with the invite link?')
		).toBeInTheDocument();
	});
});
