import { processCloudApiWebhookPayload } from '@src/helpers/CloudApiWebhookHelper';
import { WabaWebhookWabaPayload } from '@src/types/webhook';

const buildPayload = (message: any): WabaWebhookWabaPayload =>
	({
		object: 'whatsapp_business_account',
		entry: [
			{
				id: 'WABA_TEST_0001',
				changes: [
					{
						field: 'messages',
						value: {
							messaging_product: 'whatsapp',
							messages: [message],
						},
					},
				],
			},
		],
	} as unknown as WabaWebhookWabaPayload);

describe('processCloudApiWebhookPayload - incoming message wa_id resolution', () => {
	it('resolves customer_wa_id from `from` for phone-number contacts', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildPayload({
				id: 'wamid.PHONE',
				from: '905383192532',
				from_user_id: 'TR.3926429744323742',
				type: 'text',
				timestamp: '1781188998',
				text: { body: 'Test' },
			})
		);

		expect(messages['wamid.PHONE'].customer_wa_id).toBe('905383192532');
	});

	it('resolves customer_wa_id from `from_user_id` for BSUID-only contacts', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildPayload({
				id: 'wamid.BSUID',
				// no `from` for username-only contacts
				from_user_id: 'US.123456789012345678',
				type: 'text',
				timestamp: '1749639601',
				text: { body: 'Are you there?' },
			})
		);

		// Previously this was '' (falsy) -> the chat never appeared without a refresh.
		expect(messages['wamid.BSUID'].customer_wa_id).toBe(
			'US.123456789012345678'
		);
	});
});
