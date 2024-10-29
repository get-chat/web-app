import styles from './InteractiveMessageList.module.css';
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SendInteractiveMessageDialog from '@src/components/SendInteractiveMessageDialog';

export interface InteractiveParameter {
	key: string;
	required?: boolean;
	advanced?: boolean;
	placeholder?: string;
	description?: string;
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
		parameters: [{ key: 'body.text', required: true, placeholder: 'Body' }],
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
			{ key: 'body.text', placeholder: 'Body' },
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
		title: 'Send address message',
		description:
			'Address messages give your users a simpler way to share the shipping address with your business.',
		warning:
			'Currently, address messages are supported in the following two countries: India and Singapore. <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/messages/address-messages">Click here</a> to read more information.',
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
			{ key: 'body.text', placeholder: 'Body' },
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
			{ key: 'header.text', placeholder: 'Header', required: true },
			{ key: 'body.text', placeholder: 'Body', required: true },
			{ key: 'footer.text', placeholder: 'Footer', required: true },
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
];

interface Props {
	onSend: (interactiveMessage: any) => void;
}

const InteractiveMessageList: React.FC<Props> = ({ onSend }) => {
	const { t } = useTranslation();
	const [selectedDescribedInteractive, setSelectedDescribedInteractive] =
		useState<any>(null);
	const [isDialogVisible, setDialogVisible] = useState(false);

	const send = (payload: any) => {
		onSend(payload);
	};

	return (
		<>
			<div className="interactiveMessagesOuter">
				<div className="interactiveMessagesWrapper">
					<div className={'interactiveMessages ' + styles.list}>
						{INTERACTIVE_MESSAGES.map((item, index) => (
							<div className={styles.item} key={index}>
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
										<div
											className={styles.description}
											dangerouslySetInnerHTML={{ __html: t(item.description) }}
										/>
									</div>
								</Button>
							</div>
						))}
					</div>
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
