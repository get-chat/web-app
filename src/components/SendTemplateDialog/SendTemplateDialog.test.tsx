import React from 'react';
import { render, screen } from '@testing-library/react';
import SendTemplateDialog from './SendTemplateDialog';
import { Template } from '@src/types/templates';
import { Person } from '@src/types/persons';

/**
 * WhatsApp accepts a MARKETING template to a customer who stopped marketing
 * messages and fails it afterwards with 131050, so the dialog warns first.
 * It only warns: the agent can still send.
 */

const buildTemplate = (category: string): Template => ({
	name: 'black_friday_offer',
	category,
	language: 'en',
	status: 'APPROVED',
	components: [{ type: 'BODY', text: 'Get 30% off everything.' }],
});

const buildPerson = (marketingOptOut: boolean): Person =>
	({
		wa_id: '905383192532',
		waba_payload: { profile: { name: 'Ayşe' }, wa_id: '905383192532' },
		initials: 'A',
		last_message_timestamp: 0,
		resolved: false,
		marketing_opt_out: marketingOptOut,
	} as Person);

const renderDialog = (template: Template, person?: Person) =>
	render(
		<SendTemplateDialog
			isVisible
			setVisible={jest.fn()}
			chosenTemplate={template}
			person={person}
			onSend={jest.fn()}
		/>
	);

const warning = () =>
	screen.queryByText('This customer stopped marketing messages');

describe('SendTemplateDialog marketing opt-out warning', () => {
	it('warns before a marketing template to an opted-out customer', () => {
		renderDialog(buildTemplate('MARKETING'), buildPerson(true));

		expect(warning()).toBeInTheDocument();
		expect(
			document.querySelector('[data-test-id="send-template-message-button"]')
		).toBeEnabled();
	});

	it('does not warn for other categories', () => {
		renderDialog(buildTemplate('UTILITY'), buildPerson(true));

		expect(warning()).not.toBeInTheDocument();
	});

	it('does not warn for customers who did not opt out', () => {
		renderDialog(buildTemplate('MARKETING'), buildPerson(false));

		expect(warning()).not.toBeInTheDocument();
	});

	it('does not warn while the customer is loading', () => {
		renderDialog(buildTemplate('MARKETING'));

		expect(warning()).not.toBeInTheDocument();
	});
});
