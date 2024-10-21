import React from 'react';

import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useTranslation } from 'react-i18next';

import ButtonsMessage from './components/ButtonsMessage';
import ListMessage from './components/ListMessage';
import ProductMessage from './components/ProductMessage';

import styles from './InteractiveMessage.module.css';
import { Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PrintMessage from '@src/components/PrintMessage';
import CtaUrlMessage from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/CtaUrlMessage/CtaUrlMessage';

export enum InteractiveMessageTypes {
	list_reply = 'list_reply',
	button = 'button',
	list = 'list',
	product = 'product',
	product_list = 'product_list',
	location_request_message = 'location_request_message',
	cta_url = 'cta_url',
}

interface Props {
	data: any;
}

const InteractiveMessage: React.FC<Props> = ({ data }) => {
	const { t } = useTranslation();
	const { header, body, footer, action, type } =
		data?.payload?.interactive ?? {};

	return (
		<>
			<div className={styles.caption}>
				<TouchAppIcon /> {t('Interactive message')}
			</div>

			{type === InteractiveMessageTypes.list_reply && (
				<div>
					<div>{data.payload.interactive.list_reply.title}</div>
					<div style={{ opacity: 0.5, fontSize: '0.8em' }}>
						{data.payload.interactive.list_reply.description}
					</div>
				</div>
			)}

			{type === InteractiveMessageTypes.button && (
				<ButtonsMessage
					header={header}
					body={body}
					footer={footer}
					action={action}
				/>
			)}

			{type === InteractiveMessageTypes.list && (
				<ListMessage
					header={header}
					body={body}
					footer={footer}
					action={action}
				/>
			)}

			{(type === InteractiveMessageTypes.product ||
				type === InteractiveMessageTypes.product_list) && (
				<ProductMessage
					header={header}
					body={body}
					footer={footer}
					action={action}
				/>
			)}

			{type === InteractiveMessageTypes.cta_url && (
				<CtaUrlMessage
					header={header}
					body={body}
					footer={footer}
					action={action}
				/>
			)}

			{type === InteractiveMessageTypes.location_request_message && (
				<>
					{body && (
						<div className={styles.body}>
							<PrintMessage linkify message={body.text} />
						</div>
					)}
					{action?.name === 'send_location' && (
						<Button
							variant="text"
							fullWidth
							startIcon={<LocationOnIcon />}
							disabled
						>
							Send location
						</Button>
					)}
				</>
			)}
		</>
	);
};

export default InteractiveMessage;
