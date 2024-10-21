import styles from './InteractiveMessageList.module.css';
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SendInteractiveMessageDialog from '@src/components/SendInteractiveMessageDialog';

export interface InteractiveParameter {
	key: string;
	required?: boolean;
}

export interface DescribedInteractive {
	title: string;
	description: string;
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
		parameters: [{ key: 'body.text', required: true }],
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
			{ key: 'header.text' },
			{ key: 'body.text' },
			{ key: 'footer.text' },
			{ key: 'action.parameters.url', required: true },
			{ key: 'action.parameters.display_text', required: true },
		],
	},
	{
		title: 'Address message',
		description:
			'Address messages are interactive messages that contain the 4 main parts: header, body, footer, and action. Inside the action component business specifies the name “address_message” and relevant parameters.',
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
			{ key: 'header.text' },
			{ key: 'body.text' },
			{ key: 'footer.text' },
			{ key: 'action.parameters.country', required: true },
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
					<div className="interactiveMessages">
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
