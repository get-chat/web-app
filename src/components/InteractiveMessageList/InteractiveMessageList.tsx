import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SendInteractiveMessageDialog from '@src/components/SendInteractiveMessageDialog';
import { useAppSelector } from '@src/store/hooks';
import { isIndianPhoneNumber } from '@src/helpers/PhoneNumberHelper';
import { List, Item, Description } from './InteractiveMessageList.styles';

export interface InteractiveParameter {
	key: string;
	required?: boolean;
	advanced?: boolean;
	placeholder?: string;
	description?: string;
	maxLength?: number;
	// Renders a dedicated control instead of a plain text field
	control?: 'listSections' | 'carouselCards' | 'replyButtons';
}

export interface DescribedInteractive {
	title: string;
	description: string;
	warning?: string;
	info?: string;
	payload: any;
	parameters: InteractiveParameter[];
}

const INTERACTIVE_MESSAGES: DescribedInteractive[] = [
	{
		title: 'Send location request message',
		description:
			'Location request message is a free-form message displaying only a <strong>body text</strong> and a <strong>send location button</strong>. When a WhatsApp user taps the button, a location sharing screen appears. The user can share their location from the sharing screen.',
		payload: {
			type: 'location_request_message',
			body: {
				text: '',
			},
			action: {
				name: 'send_location',
			},
		},
		parameters: [{ key: 'body.text', placeholder: 'Body', required: true }],
	},
	{
		title: 'Send call-to-action URL button message',
		description:
			'Your customers may be hesitant to tap raw URLs containing lengthy or obscure strings in text messages. In these situations, you may wish to send an interactive call-to-action (CTA) URL button message.',
		payload: {
			type: 'cta_url',
			header: {
				type: 'text',
				text: '',
			},
			body: {
				text: '',
			},
			footer: {
				text: '',
			},
			action: {
				name: 'cta_url',
				parameters: {
					url: '',
					display_text: '',
				},
			},
		},
		parameters: [
			{ key: 'header.text', placeholder: 'Header' },
			{ key: 'body.text', placeholder: 'Body', required: true },
			{ key: 'footer.text', placeholder: 'Footer' },
			{
				key: 'action.parameters.url',
				required: true,
				placeholder: 'Action URL',
			},
			{
				key: 'action.parameters.display_text',
				required: true,
				placeholder: 'Action Display Text',
			},
		],
	},
	{
		title: 'Send reply buttons message',
		description:
			'Reply buttons messages offer up to <strong>3 buttons</strong> as quick answer options. They are a quicker way for your customers to make a selection, and the tapped button is sent back to you as a reply.',
		payload: {
			type: 'button',
			header: {
				type: 'text',
				text: '',
			},
			body: {
				text: '',
			},
			footer: {
				text: '',
			},
			action: {
				buttons: [
					{
						type: 'reply',
						reply: {
							id: '',
							title: '',
						},
					},
				],
			},
		},
		parameters: [
			{ key: 'header.text', placeholder: 'Header', maxLength: 60 },
			{
				key: 'body.text',
				placeholder: 'Body',
				required: true,
				maxLength: 1024,
			},
			{ key: 'footer.text', placeholder: 'Footer', maxLength: 60 },
			{ key: 'action.buttons', control: 'replyButtons' },
		],
	},
	{
		title: 'Send list message',
		description:
			'List messages offer your customers a choice of up to <strong>10 options</strong>, organized in one or more sections. The options are revealed when the customer taps the <strong>button</strong> and the selected option is sent back to you as a reply.',
		payload: {
			type: 'list',
			header: {
				type: 'text',
				text: '',
			},
			body: {
				text: '',
			},
			footer: {
				text: '',
			},
			action: {
				button: '',
				sections: [
					{
						title: '',
						rows: [
							{
								id: '',
								title: '',
								description: '',
							},
						],
					},
				],
			},
		},
		parameters: [
			{ key: 'header.text', placeholder: 'Header', maxLength: 60 },
			{
				key: 'body.text',
				placeholder: 'Body',
				required: true,
				maxLength: 4096,
			},
			{ key: 'footer.text', placeholder: 'Footer', maxLength: 60 },
			{
				key: 'action.button',
				placeholder: 'Button text',
				required: true,
				maxLength: 20,
			},
			{ key: 'action.sections', control: 'listSections' },
		],
	},
	{
		title: 'Send media carousel message',
		description:
			'Media carousel messages display a set of <strong>2 to 10</strong> horizontally scrollable cards. Each card shows an <strong>image or video</strong>, an optional body text and a <strong>URL button</strong>.',
		info: 'Cards with quick-reply buttons are currently only supported when sent via the API.',
		payload: {
			type: 'carousel',
			body: {
				text: '',
			},
			action: {
				cards: [
					{
						type: 'cta_url',
						header: {
							type: 'image',
							image: {
								link: '',
							},
						},
						body: {
							text: '',
						},
						action: {
							name: 'cta_url',
							parameters: {
								display_text: '',
								url: '',
							},
						},
					},
					{
						type: 'cta_url',
						header: {
							type: 'image',
							image: {
								link: '',
							},
						},
						body: {
							text: '',
						},
						action: {
							name: 'cta_url',
							parameters: {
								display_text: '',
								url: '',
							},
						},
					},
				],
			},
		},
		parameters: [
			{
				key: 'body.text',
				placeholder: 'Body',
				required: true,
				maxLength: 1024,
			},
			{ key: 'action.cards', control: 'carouselCards' },
		],
	},
	{
		title: 'Send address message',
		description:
			'Address messages give your users a simpler way to share the shipping address with your business.',
		warning:
			'Currently, address messages are only available for businesses based in India and their India customers. <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/messages/address-messages" target="_blank">Click here</a> to read more information.',
		payload: {
			type: 'address_message',
			header: {
				type: 'text',
				text: '',
			},
			body: {
				text: '',
			},
			footer: {
				text: '',
			},
			action: {
				name: 'address_message',
				parameters: {
					country: '',
				},
			},
		},
		parameters: [
			{ key: 'header.text', placeholder: 'Header' },
			{ key: 'body.text', placeholder: 'Body', required: true },
			{ key: 'footer.text', placeholder: 'Footer' },
			{
				key: 'action.parameters.country',
				required: true,
				placeholder: 'Country ISO Code',
			},
		],
	},
	{
		title: 'Send flow message',
		description:
			'You can use Flows to generate leads, recommend products, get new sales leads, or anything else where structured communication is more natural or comfortable for your customers.',
		info: 'To send WhatsApp Flows with additional parameters, please use the API.',
		payload: {
			type: 'flow',
			header: {
				type: 'text',
				text: '',
			},
			body: {
				text: '',
			},
			footer: {
				text: '',
			},
			action: {
				name: 'flow',
				parameters: {
					flow_message_version: '3',
					flow_token: 'unused',
					flow_id: '',
					flow_cta: '',
					flow_action: 'navigate',
					flow_action_payload: {
						screen: '',
						/*data: {
							product_name: '',
							product_description: '',
							product_price: 100,
						},*/
					},
				},
			},
		},
		parameters: [
			{ key: 'header.text', placeholder: 'Header' },
			{ key: 'body.text', placeholder: 'Body', required: true },
			{ key: 'footer.text', placeholder: 'Footer' },
			{
				key: 'action.parameters.flow_token',
				placeholder: 'Flow Token',
				required: true,
				advanced: true,
			},
			{
				key: 'action.parameters.flow_id',
				placeholder: 'Flow ID',
				description:
					'<a href="https://business.facebook.com/latest/whatsapp_manager" target="_blank">Go to WhatsApp Manager</a> > Flows section to copy your Flow ID',
				required: true,
			},
			{
				key: 'action.parameters.flow_cta',
				placeholder: 'Flow CTA',
				description: 'Call-to-action button text',
				required: true,
			},
			{
				key: 'action.parameters.flow_action',
				placeholder: 'Flow Action',
				required: true,
				advanced: true,
			},
			{
				key: 'action.parameters.flow_action_payload.screen',
				placeholder: 'Flow Action Screen',
				description:
					'<a href="https://business.facebook.com/latest/whatsapp_manager" target="_blank">Go to WhatsApp Manager</a> > Flows section and open your Flow details page to list all screens available',
				required: true,
			},
		],
	},
	{
		title: 'Send catalog message',
		description:
			'Catalog messages are messages that allow you to showcase your product catalog entirely within WhatsApp.',
		payload: {
			type: 'catalog_message',
			body: {
				text: '',
			},
			footer: {
				text: '',
			},
			action: {
				name: 'catalog_message',
				parameters: {
					thumbnail_product_retailer_id: '',
				},
			},
		},
		parameters: [
			{ key: 'body.text', placeholder: 'Body', required: true },
			{ key: 'footer.text', placeholder: 'Footer' },
			{
				key: 'action.parameters.thumbnail_product_retailer_id',
				placeholder: 'Thumbnail Product Retailer ID',
			},
		],
	},
];

interface Props {
	onSend: (interactiveMessage: any) => void;
}

const InteractiveMessageList: React.FC<Props> = ({ onSend }) => {
	const { t } = useTranslation();
	const [selectedDescribedInteractive, setSelectedDescribedInteractive] =
		useState<any>(null);
	const [isDialogVisible, setDialogVisible] = useState(false);

	const businessPhoneNumber = useAppSelector(
		(state) => state.phoneNumber.value
	);
	const currentChatWaId = useAppSelector((state) => state.waId.value);

	// Address messages are only available for businesses based in India (+91)
	// and their India customers, so hide them for everyone else
	const isAddressMessageAvailable =
		isIndianPhoneNumber(businessPhoneNumber) &&
		isIndianPhoneNumber(currentChatWaId);

	const availableInteractiveMessages = INTERACTIVE_MESSAGES.filter(
		(item) =>
			item.payload.type !== 'address_message' || isAddressMessageAvailable
	);

	const send = (payload: any) => {
		onSend(payload);
	};

	return (
		<>
			<div className="interactiveMessagesOuter">
				<div className="interactiveMessagesWrapper">
					<List>
						{availableInteractiveMessages.map((item, index) => (
							<Item key={index}>
								<Button
									onClick={() => {
										setSelectedDescribedInteractive(item);
										setDialogVisible(true);
									}}
									// @ts-ignore
									color="black"
								>
									<div>
										<h4>{t(item.title)}</h4>
										<Description
											dangerouslySetInnerHTML={{ __html: t(item.description) }}
										/>
									</div>
								</Button>
							</Item>
						))}
					</List>
				</div>
			</div>

			<SendInteractiveMessageDialog
				isVisible={isDialogVisible}
				setVisible={setDialogVisible}
				describedInteractive={selectedDescribedInteractive}
				onSend={(interactiveMessage) => send(interactiveMessage)}
			/>
		</>
	);
};

export default InteractiveMessageList;
