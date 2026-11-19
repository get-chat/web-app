import { processCloudApiWebhookPayload } from '@src/helpers/CloudApiWebhookHelper';
import { WabaWebhookWabaPayload } from '@src/types/webhook';
import { MessageEchoOrigin } from '@src/types/messages';

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

describe('processCloudApiWebhookPayload - serialized incoming messages', () => {
	const envelopeMessage = {
		id: 'wamid.REPLY',
		from: '905383192532',
		type: 'text',
		timestamp: '1783956959',
		text: { body: 'Replying to you' },
		// The envelope context only refers to the replied message
		context: { id: 'wamid.ORIGINAL', from: '4930754386733' },
	};

	const serializedMessage = {
		id: '0b6b4f6e-0000-0000-0000-000000000000',
		waba_payload: envelopeMessage,
		contact: { wa_id: '905383192532' },
		from_us: false,
		received: false,
		sender: null,
		// The serialized message resolves the context into a full message
		context: {
			id: '706371f3-0000-0000-0000-000000000000',
			waba_payload: {
				id: 'wamid.ORIGINAL',
				to: '905383192532',
				type: 'text',
				timestamp: '1783956931',
				text: { body: 'Original message' },
			},
			from_us: true,
		},
		customer_wa_id: '905383192532',
		tags: [],
		chat_tags: [],
	};

	it('prefers the serialized message carrying the resolved reply context', () => {
		const payload = buildPayload(envelopeMessage) as any;
		payload.incoming_messages = [serializedMessage];

		const { messages } = processCloudApiWebhookPayload(payload);

		const message = messages['wamid.REPLY'];
		expect(message.id).toBe(serializedMessage.id);
		expect(message.context?.waba_payload?.text?.body).toBe('Original message');
	});

	it('falls back to the envelope message when no serialized one is present', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildPayload(envelopeMessage)
		);

		const message = messages['wamid.REPLY'];
		expect(message).toBeDefined();
		expect(message.context).toBeUndefined();
	});
});

const buildEchoPayload = (
	field: string,
	echoMessage: any
): WabaWebhookWabaPayload =>
	({
		object: 'whatsapp_business_account',
		entry: [
			{
				id: 'WABA_TEST_0001',
				changes: [
					{
						field,
						value: {
							messaging_product: 'whatsapp',
							metadata: {
								display_phone_number: '4915792500517',
								phone_number_id: '100232166049895',
							},
							[field]: [echoMessage.waba_payload],
						},
					},
				],
			},
		],
		echo_messages: [echoMessage],
	} as unknown as WabaWebhookWabaPayload);

const buildEchoMessage = (wabaPayload: any) => ({
	id: 'f9a6b7c8-0000-0000-0000-000000000000',
	waba_payload: wabaPayload,
	waba_statuses: { sent: null, delivered: null, read: null },
	contact: { wa_id: '905383192532' },
	from_us: true,
	received: false,
	sender: null,
	customer_wa_id: '905383192532',
	tags: [],
	chat_tags: [],
});

describe('processCloudApiWebhookPayload - message echoes', () => {
	const textWabaPayload = {
		from: '4915792500517',
		to: '905383192532',
		id: 'wamid.ECHO',
		timestamp: '1783523820',
		type: 'text',
		text: { body: 'sent via the API, not the inbox' },
	};

	it('emits echoed messages keyed by waba id, keeping the serialized data', () => {
		const { messages, statuses } = processCloudApiWebhookPayload(
			buildEchoPayload('message_echoes', buildEchoMessage(textWabaPayload))
		);

		const message = messages['wamid.ECHO'];
		expect(message).toBeDefined();
		expect(message.from_us).toBe(true);
		expect(message.sender).toBeNull();
		expect(message.customer_wa_id).toBe('905383192532');
		expect(message.waba_payload?.text?.body).toBe(
			'sent via the API, not the inbox'
		);
		expect(Object.keys(statuses)).toHaveLength(0);
	});

	it('marks messages from field message_echoes as API echoes', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildEchoPayload('message_echoes', buildEchoMessage(textWabaPayload))
		);

		expect(messages['wamid.ECHO'].echo_origin).toBe(MessageEchoOrigin.api);
	});

	it('marks messages from field smb_message_echoes as WhatsApp Business app echoes', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildEchoPayload('smb_message_echoes', buildEchoMessage(textWabaPayload))
		);

		expect(messages['wamid.ECHO'].echo_origin).toBe(MessageEchoOrigin.smb);
	});

	it('passes through echoes of unknown message types', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildEchoPayload(
				'message_echoes',
				buildEchoMessage({
					from: '4915792500517',
					to: '905383192532',
					id: 'wamid.UNKNOWN',
					timestamp: '1783523820',
					type: 'some_future_type',
					some_future_type: { foo: 'bar' },
				})
			)
		);

		expect(messages['wamid.UNKNOWN']).toBeDefined();
		expect(messages['wamid.UNKNOWN'].echo_origin).toBe(MessageEchoOrigin.api);
	});

	it('falls back to the internal getchat id key when the waba id is missing', () => {
		const echoMessage = buildEchoMessage({
			...textWabaPayload,
			id: undefined,
		});

		const { messages } = processCloudApiWebhookPayload(
			buildEchoPayload('message_echoes', echoMessage)
		);

		// Same key format as prepareMessageList to avoid duplicates on refetch
		expect(messages['getchatId_' + echoMessage.id]).toBeDefined();
	});
});

describe('processCloudApiWebhookPayload - WhatsApp group messages', () => {
	const GROUP_ID = 'Y2FwaV9ncm91cDoxNzA1NTU1MDEzOToxMjAzNjM0MDQ2OTQyMzM4MjAZD';

	const groupMessage = {
		id: 'wamid.GROUP',
		from: '34612448190',
		group_id: GROUP_ID,
		type: 'text',
		timestamp: '1763500000',
		text: { body: 'Hi all, thanks for setting this up.' },
	};

	const buildGroupPayload = (
		message: any,
		contacts: any[],
		extra: object = {}
	): WabaWebhookWabaPayload =>
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
								contacts,
								messages: [message],
							},
						},
					],
				},
			],
			...extra,
		} as unknown as WabaWebhookWabaPayload);

	it('files the message under the group chat and keeps its sender', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildGroupPayload(groupMessage, [
				{ wa_id: '34612448190', profile: { name: 'María López' } },
			])
		);

		const message = messages['wamid.GROUP'];
		expect(message.customer_wa_id).toBe(GROUP_ID);
		expect(message.from_us).toBe(false);
		expect(message.group_participant).toEqual({
			wa_id: '34612448190',
			user_id: undefined,
			name: 'María López',
		});
	});

	it('picks the sender among several contacts, by wa_id or user_id', () => {
		const contacts = [
			{ wa_id: '4915122348812', profile: { name: 'Jonas Weber' } },
			{
				wa_id: '',
				user_id: 'US.123456789',
				profile: { name: 'Priya Nair' },
			},
		];

		const byUserId = processCloudApiWebhookPayload(
			buildGroupPayload(
				{ ...groupMessage, from: undefined, from_user_id: 'US.123456789' },
				contacts
			)
		).messages['wamid.GROUP'];

		expect(byUserId.customer_wa_id).toBe(GROUP_ID);
		expect(byUserId.group_participant?.name).toBe('Priya Nair');
		expect(byUserId.group_participant?.user_id).toBe('US.123456789');
	});

	it('leaves 1:1 messages under the sender', () => {
		const { messages } = processCloudApiWebhookPayload(
			buildGroupPayload({ ...groupMessage, group_id: undefined }, [])
		);

		expect(messages['wamid.GROUP'].customer_wa_id).toBe('34612448190');
		expect(messages['wamid.GROUP'].group_participant).toBeUndefined();
	});

	it('keeps the group chat and the sender name for the serialized message', () => {
		const serialized = {
			id: '0b6b4f6e-0000-0000-0000-000000000001',
			waba_payload: groupMessage,
			// An older backend could still file it under the participant
			customer_wa_id: '34612448190',
			from_us: false,
			received: false,
			tags: [],
			chat_tags: [],
			is_failed: false,
		};

		const { messages } = processCloudApiWebhookPayload(
			buildGroupPayload(
				groupMessage,
				[{ wa_id: '34612448190', profile: { name: 'María López' } }],
				{ incoming_messages: [serialized] }
			)
		);

		const message = messages['wamid.GROUP'];
		expect(message.id).toBe(serialized.id);
		expect(message.customer_wa_id).toBe(GROUP_ID);
		expect(message.group_participant?.name).toBe('María López');
	});
});
