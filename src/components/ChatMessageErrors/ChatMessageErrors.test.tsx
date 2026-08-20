import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessageErrors from './ChatMessageErrors';
import { Message, MessageType } from '@src/types/messages';

const baseMessage = (errors: any[]): Message =>
	({
		id: 'msg-1',
		from_us: true,
		received: false,
		customer_wa_id: '1234567890',
		tags: [],
		chat_tags: [],
		is_failed: true,
		waba_payload: {
			id: 'waba-1',
			type: MessageType.template,
			errors,
		},
	} as Message);

describe('ChatMessageErrors', () => {
	it('displays details from the legacy on-premise error format', () => {
		render(
			<ChatMessageErrors
				data={baseMessage([
					{
						code: 1000,
						title: 'Some title',
						details: 'Legacy error details',
					},
				])}
			/>
		);

		expect(screen.getByText('Legacy error details')).toBeInTheDocument();
		expect(screen.getByText('Some title')).toBeInTheDocument();
	});

	it('displays message from the Cloud API / Graph error format', () => {
		render(
			<ChatMessageErrors
				data={baseMessage([
					{
						code: 100,
						type: 'OAuthException',
						message: "(#100) The parameter template['language'] is required.",
						fbtrace_id: 'ALW4a_5aNapOSQZZ7wvH16X',
					},
				])}
			/>
		);

		expect(
			screen.getByText("(#100) The parameter template['language'] is required.")
		).toBeInTheDocument();
		expect(screen.getByText('OAuthException')).toBeInTheDocument();
	});

	it('prefers error_data.details over message when both exist', () => {
		render(
			<ChatMessageErrors
				data={baseMessage([
					{
						code: 131047,
						title: 'Re-engagement message',
						message: 'Re-engagement message',
						error_data: {
							details:
								'Message failed to send because more than 24 hours have passed.',
						},
					},
				])}
			/>
		);

		expect(
			screen.getByText(
				'Message failed to send because more than 24 hours have passed.'
			)
		).toBeInTheDocument();
	});
});
